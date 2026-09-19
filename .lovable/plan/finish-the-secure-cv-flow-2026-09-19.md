# Finish the Secure CV Flow

## Viewer page
- Add `/cv/viewer` with route-specific private/no-index metadata.
- Read the verified email saved by the request flow, ask the existing CV access endpoint for authorization and current CV data, and redirect to `/cv/request` if missing, rejected, pending, or invalid.
- Render a centered, responsive A4-style document with the saved profile photo, name, summary, contact details, skills, languages, and education/experience.
- Add the requested copy deterrents: non-selectable document, blocked context menu, print-hidden page, and a repeating diagonal viewer-email watermark above the content without blocking interaction.
- Include clear loading and access-check states so protected content never flashes before approval is confirmed.

## Navigation
- Add matching **CV Manager** and **Email Settings** entries to both desktop and mobile admin navigation.
- Add a prominent **Request CV** action to the public hamburger menu and footer, linking to `/cv/request` through the app router.

## Validation
- Confirm generated routes recognize all new links.
- Check current build diagnostics after implementation.
- Exercise the public request/viewer redirects and verify desktop and mobile layouts in the running preview.

## Technical details
- Keep the existing OTP, approval endpoint, database policies, and private image-storage flow unchanged.
- The browser email value identifies the approved request to the current endpoint; it is revalidated server-side before any CV content is returned.
- These browser controls discourage casual copying but cannot guarantee prevention of screenshots or determined extraction once content is displayed.
