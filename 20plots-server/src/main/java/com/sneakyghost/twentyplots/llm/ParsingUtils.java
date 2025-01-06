package com.sneakyghost.twentyplots.llm;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ParsingUtils {
    public static Map<String, String> parseJson(String json)
            throws JsonParseException, JsonMappingException, IOException {
        String escapedJson = escapeControlCharacters(json);
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, String> map = objectMapper.readValue(escapedJson, new TypeReference<Map<String, String>>() {
        });
        return map;
    }

    private static String escapeControlCharacters(String json) {
        // This pattern matches JSON strings, taking escaped double quotes into account
        Pattern pattern = Pattern.compile("\"([^\"\\\\]*(\\\\.[^\"\\\\]*)*)\"");
        Matcher matcher = pattern.matcher(json);

        StringBuffer result = new StringBuffer(json.length());
        while (matcher.find()) {
            // We replace the matched JSON string with its escaped version
            String replacement = matcher.group().replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t")
                    .replace("\b", "\\b").replace("\f", "\\f");
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(result);

        return result.toString();
    }
}
