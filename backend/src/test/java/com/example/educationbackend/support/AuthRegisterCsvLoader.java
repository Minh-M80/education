package com.example.educationbackend.support;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

public final class AuthRegisterCsvLoader {
    private static final Path REGISTER_CSV_PATH = Path.of("..", "postman", "uc-split-pass-fail", "uc1-register1-data.csv");

    private AuthRegisterCsvLoader() {
    }

    public static Stream<RegisterCsvCase> loadRegisterCases() throws IOException {
        try (Reader reader = Files.newBufferedReader(REGISTER_CSV_PATH);
             CSVParser parser = CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .build()
                     .parse(reader)) {
            List<RegisterCsvCase> cases = parser.stream()
                    .map(AuthRegisterCsvLoader::toCase)
                    .toList();
            return cases.stream();
        }
    }

    private static RegisterCsvCase toCase(CSVRecord record) {
        return new RegisterCsvCase(
                record.get("tc_name"),
                record.get("body_raw").replace("{{run_id}}", "itest"),
                Integer.parseInt(record.get("expected_status")),
                record.get("expected_text_contains")
        );
    }

    public record RegisterCsvCase(
            String testName,
            String requestBody,
            int expectedStatus,
            String expectedTextContains
    ) {
        @Override
        public String toString() {
            return testName;
        }
    }
}
