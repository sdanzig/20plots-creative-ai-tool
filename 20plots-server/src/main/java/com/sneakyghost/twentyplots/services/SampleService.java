package com.sneakyghost.twentyplots.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sneakyghost.twentyplots.entities.Sample;
import com.sneakyghost.twentyplots.db.SampleRepository;

@Service
public class SampleService {

    @Autowired
    private SampleRepository sampleRepository;

    public Sample getSample(Long userId, Long plotId, String format) {
        Sample sample = sampleRepository.findByUserIdAndPlotIdAndFormat(userId, plotId, format);
        return sample;
    }

    public void addNewSampleToPlot(Long userId, Long plotId, String format, String text) {
    Sample newSample = new Sample();
        newSample.setUserId(userId);
        newSample.setPlotId(plotId);
        newSample.setFormat(format);
        newSample.setText(text);
        sampleRepository.save(newSample);
    sampleRepository.save(newSample);

    }
}
