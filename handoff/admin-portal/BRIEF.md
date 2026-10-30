# UTSW MyCare 2.0 – Admin Portal brief (verbatim)

The original request, saved unchanged so the implementation chat can read it from the repo. The analysis and recommendations are in `HANDOVER.md`.

---

UTSW MyCare 2.0 — Admin Portal Design & Development
Project Objective
I want to design and develop a complete, modern, professional web-based Admin Portal for the existing UTSW MyCare 2.0 patient mobile application.
The mobile application has already been developed in this project. The Admin Portal must be directly connected conceptually and functionally to the mobile app, allowing authorised UTSW administrators to manage its content, configurations, navigation, campaigns, alerts, notifications, and other supported functionality.
The Admin Portal must follow the existing mobile application's design language and official UT Southwestern branding.
This is a healthcare product, so prioritise accessibility, clarity, reliability, security, and ease of use.
1. First, Analyse the Existing Project
Before planning the Admin Portal, thoroughly inspect the existing repository and the work already completed.
Understand the following:

* Existing technology stack and framework.
* Project structure and routing.
* Current mobile application architecture.
* Existing components and reusable UI patterns.
* Design tokens, colours, typography, spacing, borders, shadows, icons, and buttons.
* Existing UTSW branding and assets.
* Existing navigation and information architecture.
* Current mobile application screens and functionality.
* API integrations, data models, and service abstractions, if present.
* Existing dependencies and conventions.
* Any existing Admin Portal implementation or related components.
* Existing responsive behaviour and accessibility patterns.

Inspect the actual code rather than making assumptions based on filenames.
Identify which parts of the existing application can be reused safely and which parts should remain isolated from the Admin Portal.
Do not modify, break, or overwrite the existing patient mobile application.
2. Understand the Product Relationship
The solution consists of two connected experiences.
Patient Mobile Application
The patient-facing application supports:

* Home screen.
* Guest and authenticated experiences.
* Find a Provider.
* Find a Location.
* Provider and facility details.
* Epic/MyChart access.
* Indoor wayfinding through Gozio.
* MedBlog and patient resources.
* Campaigns and featured content.
* Emergency alerts.
* Quick Links.
* Notifications.
* Search.
* Personalisation and preferences.
* Location-aware experiences.

Admin Portal
The Admin Portal is the configuration and operational management interface for authorised UTSW teams.
It must allow administrators to manage the supported aspects of the mobile application without requiring a mobile app release wherever the approved architecture permits.
The Admin Portal must not recreate the entire patient app, replace Epic/MyChart, or independently introduce unsupported mobile functionality.
Only expose controls for capabilities supported by the mobile application, backend, and approved integrations.
3. Complete Admin Portal Functional Scope
Design the Admin Portal around the following functional modules.
Module 1: Admin Authentication and Access Control
Provide an administrative authentication experience consistent with UTSW security requirements.
Include:

* Login and authentication states.
* UTSW-approved SSO/IAM integration points.
* MFA support through the approved authentication mechanism.
* Role-based navigation.
* Permission-aware actions.
* Session expiry.
* Logout.
* Access-denied states.

The planned roles are:

* Super Admin.
* Admin.
* Marketing.

The exact permission matrix must remain configurable or clearly documented as pending confirmation.
Do not assume a custom username/password system replaces UTSW SSO and MFA.
Module 2: Admin Dashboard
Create a professional dashboard providing an overview of the mobile application's administrative and operational status.
Potential sections:

* Overview metrics.
* App engagement indicators.
* Content publication status.
* Campaign status.
* Emergency alerts.
* Scheduled notifications.
* Pending administrative actions.
* Wayfinding upload and publication status.
* Recent administrative activity.
* Operational alerts where data is available.

Use appropriate metric cards, charts, status indicators, and tables.
The dashboard must be useful without becoming visually overcrowded.
Only display metrics that are supported by the available data. Clearly identify mock data during prototyping.
Module 3: User Management
Build a complete administrative user-management workflow.
User Listing
Include:

* User name.
* Email address.
* Assigned role.
* Account status.
* Creation or update information where available.
* Search.
* Role filters.
* Account-status filters.
* View and edit actions.

Create User
Include:

* First name.
* Last name.
* Email address.
* Role assignment.
* Required-field validation.
* Email-format validation.
* Duplicate-account prevention.
* Invitation or activation status where supported.

User Details and Management
Include:

* User profile.
* Assigned permissions or role.
* Editable information.
* Account status management.
* Relevant confirmation dialogs.
* Success and error feedback.
* Account deletion where authorised and supported.

Invitation and activation behaviour must follow the final approved authentication workflow.
Module 4: Home Screen Management
This is one of the most important modules in the entire Admin Portal.
It directly controls the patient-facing mobile home screen.
Create an intuitive configuration interface supporting:

* Module library.
* Adding and removing supported modules.
* Reordering modules.
* Module visibility.
* Guest home-screen configuration.
* Authenticated home-screen configuration.
* Audience-based visibility where supported.
* Mobile app preview.

Configurable Mobile Modules
A. Campaigns
Support configuration of:

* Campaign title.
* Campaign type.
* Campaign image or banner.
* Description.
* Call-to-action label.
* Destination type.
* Destination.
* Target audience.
* Start date and time.
* End date and time.
* Time zone.
* Publication status.
* Mobile preview.

The SOW proposes three to five campaigns for the MVP, subject to client confirmation.
B. Emergency Alerts
Support:

* Alert title.
* Alert type.
* Alert message.
* Alert icon.
* CTA label.
* CTA destination type.
* CTA destination.
* Target audience.
* Start and end dates.
* Start and end times.
* Time zone.
* Display duration.
* Publication status.
* Mobile preview.

Make emergency alert configuration clear and distinguish it visually from ordinary promotional campaigns.
C. Quick Links
Support:

* Title.
* Icon.
* Icon alternative text.
* App destination or redirection.
* Publication status.
* Mobile preview.

Examples from the patient app include messaging a doctor, viewing test results, managing visits, and managing billing through MyChart.
D. Featured Cards
Support:

* Title.
* Icon.
* Icon alternative text.
* Destination.
* Publication status.
* Mobile preview.

Publishing Workflow
Support the proposed lifecycle where approved:

* Save Draft.
* Deploy to Demo.
* Request Changes.
* Publish to Production.
* Rollback where supported.

Clearly distinguish draft, demo, and production states.
Do not make unpublished changes appear live in the patient application.
Module 5: Content and Navigation Configuration
Build configuration screens for the mobile app's supported visual settings and navigation elements.
Global Colours
Support the approved global colour settings:

* Primary global app colour.
* Secondary global app colour.
* Tertiary global app colour.
* Background global app colour.
* Other explicitly supported global colour settings.

Provide colour controls, validation, and an appropriate preview.
Do not assume administrators can change every component-level style or arbitrarily modify the mobile design system.
Drawer / More Options
Allow administrators to configure supported navigation items.
Include:

* Navigation item listing.
* Visibility controls.
* Supported destinations.
* Ordering where supported.
* Preview.

App Entry
Support:

* App-entry configuration.
* End User License Agreement visibility.
* Login prompt visibility.
* Login prompt type.
* Appropriate preview and validation.

Module 6: Provider and Search Configuration
Build configuration interfaces for approved search-related capabilities.
Include:

* Query mappings.
* Synonyms.
* Specialty mappings.
* Zero-result search queries.
* Approved search-ranking parameters.
* Validation and save workflows.

Potential ranking parameters include relevance, distance, availability, and language/accessibility matching where supported.
Do not create unsupported controls for search algorithms or ranking behaviour.
Module 7: Wayfinding Configuration
Build a complete interface for managing Gozio wayfinding files.
The approved baseline workflow is manual JSON file export and upload.
Required Workflow

1. Open the Wayfinding module.
2. Review the current published version and upload history.
3. Select and upload the JSON file.
4. Show upload progress.
5. Validate the file structure and format.
6. Display validation results.
7. Show appropriate success or error messages.
8. Publish the validated file to the demo environment.
9. Support validation of the demo configuration.
10. Publish the approved configuration to production.
11. Display the resulting published version and history.

Required Interface Elements

* Upload area.
* File selection.
* File information.
* Upload progress.
* Validation status.
* Error details.
* Current published version.
* Last-updated date and time.
* Publication history.
* Publishing user and comment where supported.
* Demo publication controls.
* Production publication controls.
* Rollback where supported.

Treat uploading and publishing as separate actions.
Do not assume a direct Gozio-to-Admin integration.
Module 8: Audience Management and Personalisation
Create an interface for managing approved audience segments and targeting rules.
Potential functionality:

* Audience listing.
* Create audience.
* Edit audience.
* Audience name and description.
* Supported eligibility criteria.
* Rule configuration.
* Audience assignment to eligible campaigns and content.
* Module visibility rules.
* Rule validation.
* Preview where supported.

The audience attributes, precedence rules, conflict handling, and privacy restrictions must follow the approved requirements.
Advanced activity-based personalisation and AI governance are not confirmed MVP deliverables.
Do not implement speculative AI configuration screens as committed features.
Module 9: Analytics and Reporting
Create an analytics experience organised into meaningful categories.
Adoption and Engagement

* Daily Active Users.
* Monthly Active Users.
* New-user activation rate.
* 30-day return rate.
* Meaningful engagement rate.
* Patient task success rate.

Digital Access and Search

* Home module click-through rate.
* Unified search success rate.
* Zero-result search rate.
* Provider profile discovery rate.

Care Actions and Wayfinding

* Find Care action conversion rate.
* Wayfinding adoption rate.

Content and App Experience

* Article engagement rate.
* Patient resource action rate.
* Notification-to-action conversion rate.
* Crash-free session rate.
* Home load time.

Include appropriate:

* Metric cards.
* Trend charts.
* Date-range filters.
* Category navigation.
* Tables where useful.
* Loading states.
* Empty states.
* Error states.

Do not fabricate real analytics integrations.
If the backend is unavailable, use clearly identified mock data and separate the presentation layer from the data service so real data can be integrated later.
Module 10: Notification Management
Create a notification-management experience.
Notification Listing
Include:

* Notification title.
* Notification type.
* Target audience.
* Scheduled date and time.
* Creation date.
* Status.
* Search and filters.
* View and edit actions where permitted.

Create or Edit Notification
Include:

* Notification title.
* Notification description.
* Send To.
* Delivery type.
* Immediate delivery.
* Scheduled delivery.
* Image.
* Image alternative text.
* Video URL.
* Destination validation.
* Mandatory-field validation.
* Save and publication feedback.

The exact notification approval, cancellation, and editing rules must be confirmed.
Module 11: Audit and Versioning
Provide administrative accountability and configuration history.
Include:

* Audit log listing.
* Search and filters.
* User or actor.
* Timestamp.
* Action performed.
* Relevant before-and-after values where supported.
* Configuration version history.
* Version details.
* Rollback where supported.
* Rollback confirmation.
* Result feedback.

Restrict access to audit information according to the approved permission matrix.
Do not claim that every configuration type supports versioning or rollback.
Module 12: Platform Operations and Location-Aware Configuration
Plan for the operational capabilities that are confirmed as part of the approved implementation.
Potential functionality includes:

* Approved integration status indicators.
* Operational error and performance visibility.
* Relevant system alerts.
* Controlled configuration promotion.
* Supported facility and building configuration.
* Mapping approved locations to contextual experiences.
* Approved location-specific information.

The SOW does not fully define these interfaces.
Do not invent integration credential management, advanced observability tools, geofencing management, Bluetooth beacon configuration, or AI administration as confirmed MVP features.
Document any such functionality as requiring further discovery and approval.
4. Recommended Information Architecture
Use the following as the starting point for the Admin Portal navigation.
Dashboard
Home Screen Management

* Overview
* Module Library
* Guest Experience
* Authenticated Experience
* Campaigns
* Emergency Alerts
* Quick Links
* Featured Cards

Content and Navigation

* Global Colours
* Drawer / More Options
* App Entry

Search Configuration

* Query Mappings
* Synonyms
* Specialty Mapping
* Zero-Result Queries
* Ranking Configuration

Wayfinding

* Overview
* Upload Files
* Validation Results
* Demo Environment
* Published Versions
* Publication History

Audience Management

* Audience Segments
* Segment Rules
* Targeting Configuration

Notifications

* All Notifications
* Create Notification
* Notification Details

Analytics and Reporting

* Overview
* Adoption and Engagement
* Search Analytics
* Content Analytics
* Care and Wayfinding
* Notification Analytics

User Management

* All Users
* Create User
* User Details

Audit and Versioning

* Audit Logs
* Configuration History
* Rollback

Platform Operations

* Integration Status
* Operational Monitoring

Settings

* Approved Administrative Settings
* Location-Aware Configuration where confirmed

You may refine the navigation after reviewing the existing architecture and considering usability, permissions, and the confirmed MVP scope.
Avoid unnecessary navigation nesting.
5. Design System and Visual Direction
The Admin Portal must look like it belongs to the same UTSW MyCare ecosystem as the existing mobile application.
First, inspect and reuse the existing design system wherever appropriate.
Visual Requirements

* Professional healthcare enterprise aesthetic.
* Alignment with official UT Southwestern branding.
* Consistent typography and colour usage.
* Clear visual hierarchy.
* Appropriate spacing and alignment.
* Consistent buttons, forms, cards, tables, modals, and drawers.
* Reusable status badges and alert components.
* Clear loading, empty, success, error, and validation states.
* Accessible contrast and readable typography.
* Predictable interactions.
* Desktop-oriented administrative layouts.
* Responsive behaviour appropriate to the agreed device requirements.

Layout Direction
Use a suitable administrative application shell with:

* Persistent sidebar navigation.
* Top header.
* Page title and breadcrumbs where useful.
* Primary content area.
* Contextual actions.
* Filters and search.
* Tables for administrative listings.
* Cards for overview metrics.
* Forms for configuration workflows.
* Preview panels for mobile content.

Do not force every screen into the same layout if a different arrangement would make the workflow easier to use.
For complex configuration screens, consider a split layout with editable settings on one side and a mobile preview on the other.
Mobile Preview
The preview should resemble the actual patient-facing mobile application.
Where practical, reuse the existing mobile components or a safe, isolated preview implementation.
Do not create an unrelated mobile design simply for the Admin preview.
The preview should show only the supported elements relevant to the selected configuration.
Accessibility
Follow the applicable UTSW accessibility requirements and the project's existing conventions.
Pay attention to:

* Keyboard navigation.
* Focus visibility.
* Form labels.
* Error identification.
* Colour contrast.
* Status communication that does not rely only on colour.
* Appropriate semantic controls.
* Accessible icon labels.

6. Technical and Implementation Rules
Inspect the actual repository before deciding how to structure the Admin Portal.
Preserve Existing Functionality

* Do not break the mobile app.
* Do not overwrite existing screens.
* Do not change the mobile app's design system unnecessarily.
* Do not remove existing dependencies without justification.
* Do not replace existing functionality with placeholders.

Application Structure
Determine whether the Admin Portal should be implemented as:

* A separate application.
* A separate route.
* A distinct module within the existing application.

Choose based on the existing architecture, deployment requirements, and code organisation.
Keep the Admin Portal logically isolated from the patient-facing experience.
Reusable Components
Create reusable components where appropriate for:

* Application shell.
* Sidebar.
* Header.
* Page headings.
* Buttons.
* Form controls.
* Tables.
* Search and filters.
* Status badges.
* Cards.
* Modals.
* Confirmation dialogs.
* Toasts.
* Empty states.
* Loading states.
* Error states.
* Mobile previews.

Avoid excessive abstraction. Prioritise maintainability and consistency.
Backend and Data
Inspect existing API integrations and data models before implementing data-dependent functionality.
If a real service is available, use the existing approved integration patterns.
If a service is unavailable:

* Use clearly identified mock data.
* Keep mock data separate from UI components.
* Create appropriate service abstractions.
* Implement realistic loading, success, empty, and error states.
* Do not claim that publishing, authentication, analytics, or notifications are genuinely connected to production systems when they are not.

Do not invent API endpoints, credentials, or undocumented backend behaviour.
Quality
Ensure:

* Existing application functionality remains intact.
* Routes work correctly.
* Forms validate appropriately.
* Tables and filters behave consistently.
* Interactive controls perform their intended actions.
* Components are reusable.
* The interface is visually consistent.
* No unnecessary dependencies are introduced.
* No dead buttons or misleading controls remain in the implemented scope.

7. Expected Deliverables
The Admin Portal work should ultimately deliver:

1. A complete Admin Portal information architecture.
2. A consistent Admin design system aligned with UTSW MyCare.
3. A functional administrative application shell.
4. The agreed Admin Portal screens and workflows.
5. Mobile preview functionality for supported configurations.
6. User management and role-aware interface behaviour.
7. Content and home-screen configuration.
8. Wayfinding upload and publication workflow interfaces.
9. Search and audience configuration interfaces where supported.
10. Notification management.
11. Analytics and reporting interfaces.
12. Audit and version-history interfaces.
13. Appropriate loading, error, empty, validation, and success states.
14. Clear documentation of mock integrations and unconfirmed requirements.

The final implementation must reflect the actual repository and approved technical capabilities.
8. Implementation Priorities
Once implementation begins, follow this recommended order:
Phase 1: Foundation

* Inspect and document the existing architecture.
* Establish the Admin application structure.
* Build the application shell.
* Establish reusable design components.
* Implement navigation and page layouts.

Phase 2: Core Administration

* Authentication-related UI.
* Role-aware navigation.
* Dashboard.
* User Management.

Phase 3: Mobile Content Configuration

* Home Screen Management.
* Guest and authenticated experiences.
* Campaigns.
* Emergency alerts.
* Quick Links.
* Featured Cards.
* Global colours.
* Drawer and App Entry.

Phase 4: Operational Workflows

* Notification Management.
* Wayfinding Configuration.
* Upload validation.
* Demo and production publication states.
* Audit and Versioning.

Phase 5: Configuration and Reporting

* Search Configuration.
* Audience Management.
* Analytics and Reporting.

Phase 6: Confirmed Advanced Features

* Platform Operations.
* Location-Aware Configuration.
* Other approved capabilities.

Do not implement every phase blindly. Confirm scope and technical dependencies before committing to conditional features.
9. Definition of Success
The Admin Portal should enable authorised UTSW teams to manage the supported patient mobile experience through a clear and reliable administrative interface.
A successful implementation will:

* Feel visually consistent with the existing MyCare mobile application.
* Follow UTSW branding.
* Provide a logical and scalable information architecture.
* Make mobile configuration easy to understand.
* Support the approved publishing lifecycle.
* Distinguish drafts, demo changes, and production configurations.
* Provide appropriate validation and feedback.
* Respect role-based permissions.
* Avoid duplicating functionality owned by Epic/MyChart or other source systems.
* Use actual integrations where available.
* Clearly identify mocked or unconfirmed functionality.
* Preserve the existing patient mobile application.

10. Final Instruction — Start in a NEW CHAT
IMPORTANT: DO NOT START IMPLEMENTING THE ADMIN PORTAL IN THIS CURRENT CHAT.
Complete your analysis of the existing project and the requirements above first.
Then prepare a concise but comprehensive handover summary containing:

* Existing technology stack.
* Existing project structure.
* Existing mobile design system.
* Reusable components and assets.
* Current mobile application functionality.
* Recommended Admin Portal architecture.
* Admin Portal information architecture.
* Implementation dependencies.
* Important constraints.
* Unconfirmed requirements.
* Recommended first implementation task.

Preserve all relevant project-specific information so that the new conversation can begin without repeating the entire analysis.
After completing this preparation, I will open a NEW CHAT in Claude Code within the appropriate project/workspace. Start the Admin Portal design and implementation in that NEW CHAT, using this entire prompt and your handover findings as the working context.
Do not implement the Admin Portal in this current conversation. Do not modify the existing mobile application while preparing the handover.
The actual implementation must begin only in the NEW CHAT.