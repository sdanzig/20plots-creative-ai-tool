package com.sneakyghost.twentyplots;

import org.springframework.http.HttpStatus;
import org.springframework.web.filter.GenericFilterBean;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class RateLimitFilter extends GenericFilterBean {

    private UserRateLimitService rateLimitService;

    public RateLimitFilter(UserRateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String clientIp = request.getRemoteAddr();
        double permitsPerSecond;
    
        // Identify the requested endpoint
        String path = httpRequest.getServletPath();
    
        // Define rate limits based on the path
        if (path.matches("^/api/plots/[^/]+/generate-sample$")) {
            permitsPerSecond = 10.0 / 60.0; // 10 requests per minute
        } else if (path.startsWith("/api/plots/generate")) {
            permitsPerSecond = 10.0 / 60.0; // 10 requests per minute
        } else if (path.startsWith("/api/login") || path.startsWith("/api/register")) {
            permitsPerSecond = 10.0 / 60.0; // 10 requests per minute
        } else {
            chain.doFilter(request, response); // Bypass rate limiter for these paths
            return; // Return early, no need to do anything else.
        }
    
        try {
            rateLimitService.attemptRequest(clientIp, permitsPerSecond);
            chain.doFilter(request, response);
        } catch (RateLimitException e) {
            // set response status to TOO_MANY_REQUESTS
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write(e.getMessage());
            response.getWriter().flush();
            response.getWriter().close();
        }
    }
}
