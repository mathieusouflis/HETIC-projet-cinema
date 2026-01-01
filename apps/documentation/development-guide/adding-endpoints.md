# 🔗 Adding Endpoints

Add endpoints in the presentation layer. Keep controllers thin. Push logic into use cases.

{% stepper %}
{% step %}
### Define the route

Add the endpoint in `presentation/routes/`.

Keep routes focused on:

* HTTP method + path
* middleware (auth, validation)
* controller method binding
{% endstep %}

{% step %}
### Validate request data

Use Zod schemas in `application/validators/`.

Reject invalid input before it reaches your use case.
{% endstep %}

{% step %}
### Implement controller method

Controllers should:

* translate HTTP → DTO
* call the use case
* translate result → HTTP response
{% endstep %}

{% step %}
### Add or reuse a use case

If business logic changes, implement it in a use case.
{% endstep %}

{% step %}
### Test it

At minimum:

* happy path
* validation failure
* auth/ownership (if applicable)
{% endstep %}
{% endstepper %}
