package com.sneakyghost.twentyplots.llm;

import java.util.Map;

import org.junit.jupiter.api.Test;

public class ParsingUtilsTest {
    @Test
    void testParseJsonWithEscapedNewlineCharactersInValues() throws Exception {
        String testString = "{ \"title\": \"Hello\\nWorld\", \"description\": \"This is a description with an embedded\\nnewline character.\" }";
        Map<String, String> output = ParsingUtils.parseJson(testString);
        // assert test string matches expected output
        String expectedTitle = "Hello\nWorld";
        String expectedDescription = "This is a description with an embedded\nnewline character.";
        assert output.get("title").equals(expectedTitle);
        assert output.get("description").equals(expectedDescription);
    }

    @Test
    void testParseJsonWithNonEscapedNewlineCharactersInValues() throws Exception {
        String testString = "{ \"title\": \"Hello\nWorld\", \"description\": \"This is a description with an embedded\nnewline character.\" }";
        Map<String, String> output = ParsingUtils.parseJson(testString);
        // assert test string matches expected output
        String expectedTitle = "Hello\nWorld";
        String expectedDescription = "This is a description with an embedded\nnewline character.";
        assert output.get("title").equals(expectedTitle);
        assert output.get("description").equals(expectedDescription);
    }

    @Test
    void testParseJsonWithNonEscapedNewlineCharactersInValuesAndJSONObject() throws Exception {
        String testString = "{\n \"title\": \"Hello\nWorld\",\n \"description\": \"This is a description with an embedded\nnewline character.\"\n }";
        Map<String, String> output = ParsingUtils.parseJson(testString);
        // assert test string matches expected output
        String expectedTitle = "Hello\nWorld";
        String expectedDescription = "This is a description with an embedded\nnewline character.";
        assert output.get("title").equals(expectedTitle);
        assert output.get("description").equals(expectedDescription);
    }

    @Test
    void testParseJsonWithEscapedNewLineCharacterAndEscapedDoubleQuotesInValues() throws Exception {
        String testString = "{ \"title\": \"Hello\\\"World\", \"description\": \"This is a description with an embedded\nnewline character.\" }";
        Map<String, String> output = ParsingUtils.parseJson(testString);
        // assert test string matches expected output
        String expectedTitle = "Hello\"World";
        String expectedDescription = "This is a description with an embedded\nnewline character.";
        assert output.get("title").equals(expectedTitle);
        assert output.get("description").equals(expectedDescription);
    }
}