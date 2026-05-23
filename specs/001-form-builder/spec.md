# Feature Specification: Simple Full-Stack Form Creation and Filling Application

**Feature Branch**: `001-form-builder`

**Created**: 2026-05-24

**Status**: Draft

**Input**: User description: "Create a simple full stack form builder and filling application. For frontend use nextjs, for backend use python. Pages: signup, signin, dashboard, create form, fill form. Form creation is incremental with text, checkbox, and radio answers. Dashboard shows submitted answers. Fills can be anonymous or logged in (autopopulated name). Python backend, GCP Cloud SQL, JWT auth, single repo dual app structure, GitHub actions building two Docker containers deploying to a GCP VM."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Authentication & Identity (Priority: P1)

As a form creator or general user, I want to securely sign up and sign in to my account so that I can manage my forms and have my details auto-populated when filling forms.

**Why this priority**: Fundamental requirement for form access control, ownership, and user identification.

**Independent Test**: Register a new user, log in, verify that a JWT is received, and access restricted dashboard endpoints.

**Acceptance Scenarios**:

1. **Given** a new user visits the Signup page, **When** they fill in their email, password, and full name, and submit, **Then** an account is created and they are redirected to the Login page.
2. **Given** an existing user on the Login page, **When** they submit valid credentials, **Then** a session token is set and they are redirected to the Dashboard.
3. **Given** an unauthenticated visitor tries to access the Dashboard or Create Form pages, **When** they request the pages, **Then** they are redirected to the Login page.

---

### User Story 2 - Incremental Form Creation (Priority: P1)

As a logged-in form creator, I want to build a dynamic form by incrementally adding questions of different input types (text input, checkbox, radio button) so that I can customize surveys or data collection forms.

**Why this priority**: Core value proposition of the form creation application.

**Independent Test**: Navigate to Create Form, add three questions (one of each type), specify answers where relevant, submit the form, and verify that it persists.

**Acceptance Scenarios**:

1. **Given** a logged-in creator on the Create Form page, **When** they click "Add Question", **Then** a new empty question block is appended to the UI.
2. **Given** a creator adding a question, **When** they select "Checkbox" or "Radio Button" as the type, **Then** they can dynamically add, edit, and remove choice options.
3. **Given** a creator who has defined a title and multiple questions, **When** they click "Publish Form", **Then** the form is saved, and they are shown a shareable public link.

---

### User Story 3 - Form Filling (Priority: P1)

As a visitor (logged in or guest), I want to view a published form and submit my answers so that the form creator receives my data.

**Why this priority**: Required to collect data and complete the form-filling loop.

**Independent Test**: Access a form's public URL, fill out all fields, submit, and confirm success message.

**Acceptance Scenarios**:

1. **Given** a guest user accesses a shareable form link, **When** they view the form, **Then** the Name and Email fields are empty, allowing them to fill them in manually.
2. **Given** a logged-in user accesses a shareable form link, **When** they view the form, **Then** their registered name and email are pre-filled and read-only.
3. **Given** a user submitting a form, **When** they leave mandatory questions unfilled, **Then** validation errors are displayed next to those questions, preventing submission.
4. **Given** a user submits valid answers, **When** they click "Submit", **Then** their submission is saved, and they see a custom success confirmation page.

---

### User Story 4 - Creator Dashboard & Analytics (Priority: P2)

As a form creator, I want to view a dashboard listing all my created forms and their submitted responses so that I can analyze the results.

**Why this priority**: Completes the lifecycle by allowing creators to review collected data.

**Independent Test**: Log in as a creator, see a list of created forms, click a form, and view a table containing all submitted responses.

**Acceptance Scenarios**:

1. **Given** a creator on the Dashboard, **When** they view the page, **Then** they see a table of all forms they created, with a count of total submissions for each form.
2. **Given** a creator clicks on a form in their dashboard, **When** the details load, **Then** they see a structured table displaying each submission row-by-row with responder name, date, and their answers.

---

### Edge Cases

- **Form deletion/archiving**: What happens to existing submissions when a form creator deletes a form or edits questions? (The system will prevent editing questions after a form receives its first submission to preserve data integrity, or warn the creator that existing submissions will be orphaned).
- **Session Expiration**: How does the system handle an expired JWT token during form submission? (If a logged-in user's token expires, they should be treated as a guest for public forms, or prompted to log in again if filling requires a verified identity).
- **No Option Selected**: If a checkbox or radio question is mandatory and no option is selected, how is it handled? (A clear frontend validation message appears, and the backend returns a 420 validation error).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support secure user registration and login with JWT-based authentication.
- **FR-002**: Form creators MUST be able to define form metadata (title, description) and dynamically add, reorder, or delete questions.
- **FR-003**: Supported question types MUST include: Single-line Text, Multi-select Checkboxes, and Single-select Radio buttons.
- **FR-004**: System MUST generate a unique, public, obfuscated URL (e.g., UUID-based) for each published form.
- **FR-005**: Forms MUST support submissions from both anonymous (unauthenticated) users and authenticated users.
- **FR-006**: Authenticated users filling a form MUST have their user profile information (Name, Email) automatically fetched and populated into the responder fields.
- **FR-007**: System MUST validate all submitted answers against the form's question schema on the backend before writing to the database.
- **FR-008**: Form creators MUST have access to a secure private dashboard showing a summary of their forms and a tabular view of all responses.

### Key Entities *(include if feature involves data)*

- **User**: Represents form creators and registered responders. Fields include: `id`, `email`, `password_hash`, `full_name`, `created_at`.
- **Form**: Represents a created questionnaire. Fields include: `id` (UUID), `creator_id`, `title`, `description`, `is_published`, `created_at`.
- **Question**: Represents an individual query within a form. Fields include: `id`, `form_id`, `question_text`, `question_type` (text, checkbox, radio), `options` (JSON list for choices), `is_required`, `order_index`.
- **Submission**: Represents a single filling event of a form. Fields include: `id`, `form_id`, `user_id` (null if guest), `responder_name`, `responder_email`, `submitted_at`.
- **Answer**: Represents a response to a specific question within a submission. Fields include: `id`, `submission_id`, `question_id`, `value` (JSON string or text for checked options/input).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Registered form creators can successfully build and publish a 5-question form in under 3 minutes.
- **SC-002**: Page load time for public form filling is under 1.5 seconds under standard network conditions.
- **SC-003**: 100% of form submissions are securely persisted and immediately accessible in the creator's dashboard within 500ms of submission.
- **SC-004**: No unauthorized user can view, edit, or delete another creator's forms or submissions.

## Assumptions

- **A-001**: A Cloud SQL PostgreSQL instance will be used to store application data.
- **A-002**: Deployment will be targeted to a single Compute Engine VM on GCP running Docker Compose to orchestrate both containers.
- **A-003**: Forms do not need file upload question types in v1.
- **A-004**: Local testing and dockerization can run on a single machine before push to GCP VM.
