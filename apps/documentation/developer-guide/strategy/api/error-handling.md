# 🚨 Error Handling

Make errors predictable. Throw meaningful domain errors. Convert them to clean HTTP responses.

### Rules of thumb

- **Domain** throws domain errors (business meaning).
- **Use cases** orchestrate and can re-throw domain errors.
- **Controllers** should not embed business rules.
- **Global middleware** maps errors to status codes + response shape.

### Suggested mapping

- Validation errors → `400`
- Auth required → `401`
- Not owner / forbidden → `403`
- Not found → `404`
- Conflicts (unique, state) → `409`
- Unexpected → `500` (log it)

### Tests to add

For each new endpoint, cover:

- invalid input (`400`)
- unauthorized (`401`)
- forbidden (`403`) when ownership matters
- not found (`404`) for missing resources
