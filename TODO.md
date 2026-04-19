# TODO

## Next Epic Integration Steps

- Add a real Epic sandbox client ID in `.env`.
- Confirm the exact SMART app type and scopes in the Epic registration record.
- Test with Epic sandbox patient context and verify the returned Observation coding patterns.
- Add better pagination and filtering if sandbox data exceeds `_count=100`.
- Add stronger error states for missing SMART context, missing patient ID, and empty Observation responses.

## Future Product / Safety Work

- Replace the simple trend chart with validated growth-chart percentile overlays from an approved source.
- Limit corrected-age display to the age ranges and chart contexts your clinical advisors approve.
- Add documentation for the source and assumptions behind the mid-parental height formula.
- Add measurement-quality hints for home entry, such as shoe removal and calibrated scale reminders.
- Add audit-friendly local data export for family review.

## Future Engineering Work

- Add unit tests for FHIR parsing and personalization utilities.
- Add schema validation for localStorage payloads.
- Add accessibility review for keyboard navigation and screen-reader descriptions.
- Add a deploy target for a public HTTPS sandbox URL.
- Add feature flags for mock mode, SMART mode, and future write-back flows.
