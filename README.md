# Store Platform — Full Feature Guide

Complete reference for everything on the website and in the admin panel: what each feature does, where it lives, and how to use it.

---

## Table of Contents

### Customer Website
1. [Home Page](#1-home-page)
2. [Shop & Product Listings](#2-shop--product-listings)
3. [Product Detail Page](#3-product-detail-page)
4. [Search](#4-search)
5. [Cart](#5-cart)
6. [Checkout](#6-checkout)
7. [Sign Up & Sign In](#7-sign-up--sign-in)
8. [My Account & Order Tracking](#8-my-account--order-tracking)
9. [Wishlist](#9-wishlist)
10. [Reviews](#10-reviews)
11. [Newsletter Subscription](#11-newsletter-subscription)
12. [About Us, Contact, Policies](#12-about-us-contact-policies)

### Admin Panel
13. [Logging In](#13-logging-in)
14. [Dashboard](#14-dashboard)
15. [Products](#15-products)
16. [Bulk Sale](#16-bulk-sale)
17. [Categories & Filters](#17-categories--filters)
18. [Orders](#18-orders)
19. [Customers](#19-customers)
20. [Reviews (Approval)](#20-reviews-approval)
21. [Discount Codes](#21-discount-codes)
22. [Newsletter](#22-newsletter)
23. [Promotional Emails](#23-promotional-emails)
24. [Email Templates](#24-email-templates)
25. [Hero Banners](#25-hero-banners)
26. [Announcement Bar](#26-announcement-bar)
27. [Currency Settings](#27-currency-settings)
28. [Shipping Settings](#28-shipping-settings)
29. [Courier Settings](#29-courier-settings)
30. [Payments](#30-payments)
31. [About Us Page](#31-about-us-page)
32. [Footer / Store Info](#32-footer--store-info)
33. [Policies Page](#33-policies-page)
34. [Privacy Policy Page](#34-privacy-policy-page)
35. [Profile](#35-profile)

---

## Customer Website

### 1. Home Page

**URL:** `/`

The homepage is the first thing customers see. It contains several sections:

- **Announcement Bar** — a scrolling ticker at the very top. Shows promotions, store hours, or any message. Configured in Admin → Announcement Bar.
- **Hero Banners** — a full-width image slider on the left with two smaller side banners on the right. All images, headings, and links are set in Admin → Hero Banners.
- **Category Icons** — a row of category icons below the hero, linking to category pages. Only categories with "Show in icons" enabled appear here.
- **Featured Products** — products marked as Featured in the admin.
- **New Arrivals** — products marked as New Arrival in the admin.
- **Sale Products** — products with a sale price set.

If no banners are configured, the hero section is hidden automatically. If a section has no products, that section is hidden too.

---

### 2. Shop & Product Listings

**URLs:** `/shop`, `/products`, `/category/:slug`

- **Shop / All Products** — shows every product in the store. Customers filter by category and brand using the left sidebar, and sort by price or newest using the sort dropdown.
- **Category pages** — e.g. `/category/laptops` shows only products in that category with the same filter/sort options.
- **Product cards** show the main image, name, star rating, price (with crossed-out original price if on sale), and an Add to Cart button.
- **Out of stock** products show a disabled Add to Cart button.

---

### 3. Product Detail Page

**URL:** `/product/:slug`

Clicking a product opens its full detail page:

- **Image gallery** — main image with a thumbnail strip below. Click a thumbnail to switch the main image.
- **Price** — shows the sale price and crossed-out original price when on sale.
- **Specifications** — a table of attribute/value pairs (e.g. RAM: 16 GB, Storage: 512 GB) defined per product in the admin.
- **Add to Cart / Wishlist** — adds the item to the cart or saves it to the wishlist. Customer must be logged in to use the wishlist.
- **Reviews** — approved customer reviews are shown at the bottom with star ratings and comments. Logged-in customers who purchased this product and have not yet reviewed it see a review submission form. Submitted reviews go to the admin for approval before they appear publicly.

---

### 4. Search

**URL:** `/search?q=keyword`

The search bar in the top navigation searches product names, brands, and descriptions. Results display on the search results page using the same card layout as the shop. If nothing matches, a "no products found" message appears.

---

### 5. Cart

**URL:** `/cart`

- Lists all items the customer has added, with quantity +/- controls and a remove button per item.
- Shows a running subtotal. Shipping fee and any discount are calculated and shown at checkout.
- Customers must be logged in to proceed to checkout.

---

### 6. Checkout

**URL:** `/checkout`

Customers fill in three sections before placing an order:

1. **Shipping details** — full name, phone number, street address, and city. If the customer has ordered before, the form pre-fills with their saved details.
2. **Discount / Promo code** — type a code and click Apply. If the code is valid, not expired, and not already used by that customer (for one-time codes), the discount appears as a negative line item. Invalid or already-used codes show a clear error message.
3. **Payment method** — only payment methods enabled in the admin appear here:
   - *Cash on Delivery* — customer pays on arrival.
   - *Bank Transfer / JazzCash / EasyPaisa* — customer sends payment manually. The account details you configured appear on screen. They enter a payment reference number.
   - *Safepay* — customer is redirected to a secure online payment page and returns after paying.

After placing the order, the customer is taken to a success page showing their order number, and they receive an Order Received email automatically.

---

### 7. Sign Up & Sign In

**URLs:** `/signup`, `/signin`

- **Sign Up** — customer enters name, email, password, and optional phone number. The account is created immediately and a verification email is sent with a one-click link.
- **Email Verification** — `/verify-email?token=...` — clicking the link in the email marks the account as verified.
- **Resend Verification** — from the account page, customers can request a new verification email if the original link expired.
- **Sign In** — email and password login. A session token is saved in the browser and keeps them logged in for 7 days.

---

### 8. My Account & Order Tracking

**URL:** `/account`

After logging in, customers see:

- **My Orders** — all orders listed with status badges: Pending, Confirmed, Packed, Shipped, Out for Delivery, Delivered, Cancelled, Returned. Expanding an order shows items, totals, shipping address, and payment method.
- **Track Package** — if a tracking number has been entered by the admin, a Track Package button appears that opens the courier's tracking page in a new tab.
- **Profile** — update name and email address.
- **Change Password** — enter current password and choose a new one (minimum 8 characters).
- **Saved Address** — the address from the last order is saved automatically and pre-fills checkout on the next order.

---

### 9. Wishlist

Logged-in customers click the heart icon on any product card or product detail page to save it to their wishlist. Saved products appear in the wishlist section on the account page. From there customers can remove items or move them to cart.

---

### 10. Reviews

Logged-in customers who have purchased a product can submit a star rating (1–5) and a written comment from the product detail page. Reviews are submitted as pending and do not appear publicly until approved by the admin.

**Automatic Review Reminder Email** — 2 weeks after an order is marked as Delivered, the customer automatically receives an email listing the products they bought with a direct "Write a Review →" link for each one. This runs in the background every hour. The email subject and message are customisable in Admin → Email Templates → Review Reminder.

---

### 11. Newsletter Subscription

A subscription form in the website footer lets any visitor enter their email to join the mailing list. Subscribers receive promotional emails sent from Admin → Promotional Emails, and quick announcements sent from Admin → Newsletter. Admin can view and manage the subscriber list from Admin → Newsletter.

---

### 12. About Us, Contact, Policies

- **About Us** `/about-us` — store story, paragraphs, and highlight tiles. Edited in Admin → About Us Page.
- **Contact** `/contact` — shows the store address, phone, email, hours, and social media links. All data comes from Admin → Footer / Store Info. Editing the footer also updates the contact page — there is nothing separate to manage for the contact page.
- **Return & Exchange Policy** `/return-exchange` — edited in Admin → Policies Page.
- **Privacy Policy** `/privacy-policy` — edited in Admin → Privacy Policy Page.

---

## Admin Panel

**URL:** `/admin`
**Login:** `/admin/login`

Sign in with your admin email and password. On success you land on the Dashboard. Sessions last 7 days. Use the **Logout** link at the bottom-left of the sidebar to end the session.

---

### 13. Logging In

Go to `/admin/login`. Enter your admin email and password. Incorrect credentials show an error — there is no lockout. After a successful login you are taken to the Dashboard. To log out, click **Logout (your name)** in the bottom-left of the sidebar.

---

### 14. Dashboard

**Nav:** Dashboard

A live snapshot of store activity:

- Total orders, total revenue, orders pending your action
- Total products and total registered customers
- A recent orders table showing order number, customer, total, and status

Use this every day to spot orders needing confirmation and to check revenue.

---

### 15. Products

**Nav:** Products

Manage the full product catalogue.

**Adding a product:**
1. Click **Add Product**.
2. Enter **Name** — the slug (URL) is generated automatically from the name but can be edited.
3. Select **Category** and enter **Brand**.
4. Write the **Description** (supports basic formatting).
5. Set **Price**. To put it on sale, toggle **On Sale** and enter a **Sale Price** below the regular price.
6. Set **Stock** — when stock hits 0 the Add to Cart button is disabled on the website.
7. Upload the **Main Image**. Add extra **Gallery Images** — these appear as thumbnails on the product page.
8. Toggle **Featured**, **New Arrival** to control which homepage sections the product appears in. Toggle **On Sale** and set a sale price to include it in the homepage sale section.
9. Under **Specifications**, select attributes for this category (e.g. RAM, Storage) and pick a value for each. These appear in the specs table on the product page and power the sidebar filters on category/shop pages.
10. Click **Save Product**.

**Editing:** Click any product row to open it, make changes, and save.

**Deleting:** Click Delete on any product row. This is permanent.

---

### 16. Bulk Sale

**Nav:** Bulk Sale

Apply or remove a sale price on many products at once.

1. Tick the checkboxes next to the products you want to update.
2. Choose **Percentage discount** (e.g. 20 for 20% off) or **Fixed sale price**.
3. Click **Apply Sale** to set all selected products on sale at once.
4. To remove the sale from products, select them and click **Remove Sale**.

Useful for seasonal sales — apply 30% off to an entire category in seconds.

---

### 17. Categories & Filters

**Nav:** Categories

**Creating a category:**
1. Click **Add Category**.
2. Enter **Name** — the slug is auto-generated.
3. Optionally upload a **Category Icon Image** (shown in the homepage icons row).
4. Set **Parent Category** if this is a sub-category (e.g. Gaming Laptops under Laptops).
5. Set **Sort Order** — lower numbers appear first in the nav and icons row.
6. Toggle **Show in Nav** to include the category in the header navigation.
7. Toggle **Show in Icons** to include it in the homepage category icons row.
8. Click **Save**.

**Category Filters (Attributes):**
Each category has its own filterable attributes — these are also the specification fields shown on product pages.

1. Click **Filters** next to a category.
2. Click **Add Attribute** — e.g. "RAM".
3. Add options to that attribute — e.g. "8 GB", "16 GB", "32 GB". Click **Add Option** for each one.
4. Repeat for other attributes (e.g. "Storage", "Processor").
5. When creating or editing a product in this category, these attributes appear as dropdown fields in the Specifications section.
6. On the website's category page, these attributes appear as checkbox filters in the sidebar, letting customers filter products by spec.

---

### 18. Orders

**Nav:** Orders

Every order placed on the website appears here, newest first. The table shows order ID, customer name, total, status, date, and item count.

**Viewing an order:**
Click an order row to expand it. You see: customer name, email, phone, shipping address, all order items with quantities and prices, subtotal, shipping fee, discount code and amount (if used), grand total, payment method, and payment reference.

**Updating order status:**
Orders flow through these stages in sequence:

```
Pending → Confirmed → Packed → Shipped → Out for Delivery → Delivered
                                                                ↓
                                                            Returned
Pending or Confirmed → Cancelled
```

Use the status dropdown inside the expanded order panel and click **Update Status**. Each status change automatically emails the customer with an update (using the template in Email Templates).

**The Confirmed status** is the most important — when you confirm an order, the customer receives a detailed confirmation email that includes the full invoice: all items, quantities, unit prices, subtotal, shipping fee, discount (with code name), and grand total, all inline in the email body.

**Entering tracking info:**
When you mark an order as Shipped, enter the **Courier Name** and **Tracking Number** in the tracking fields and click Save Tracking. This tracking number appears in the shipped email and on the customer's account page with a Track Package button pointing to the courier's tracking URL.

**Downloading an invoice:**
Click **↓ Download Invoice** in the expanded order panel to download a PDF version of the order invoice. The PDF includes your store branding, invoice number, customer details, itemised order table, and totals.

---

### 19. Customers

**Nav:** Customers

A table of every registered customer — name, email, phone, sign-up date, and total order count. Click any row to view that customer's full order history and contact details. Customers manage their own profile; this is a read-only view from the admin side.

---

### 20. Reviews (Approval)

**Nav:** Reviews

Customer-submitted reviews must be approved before they appear on product pages.

**Tabs:**
- **Pending** (default) — reviews awaiting approval, highlighted in amber. Each row shows the product, author, rating, and comment.
  - **Approve** — publishes the review on the product page immediately.
  - **Reject** — deletes the review permanently.
- **Approved** — currently live reviews. Click **Delete** to remove one.
- **All** — shows pending and approved together.

**Seeding a review:**
Use the form at the top to add a review as the admin — useful for populating a new product with reviews. Select the product, enter a reviewer name, rating (1–5 stars), and optional comment. Admin-seeded reviews are approved immediately and appear on the product page right away.

---

### 21. Discount Codes

**Nav:** Discount Codes

Create promo codes customers can enter at checkout.

**Creating a code:**
1. Click **Add Code**.
2. Enter the **Code** — e.g. `EID20`. Codes are case-insensitive.
3. Choose **Type**: Percentage (e.g. 20% off the subtotal) or Fixed (e.g. Rs. 500 off).
4. Enter the **Value** — 20 for 20%, or 500 for a fixed amount.
5. Set an **Expiry Date** if the code should stop working after a certain date. Leave blank for no expiry.
6. **Reusable** — off (default) means each customer can only redeem this code once. On means the same customer can use it on every order.
7. Click **Save**.

**Managing codes:**
- The **Active** toggle enables or disables a code without deleting it. Useful for temporarily suspending a code.
- **Delete** permanently removes the code and all redemption records.

**How it works for customers:**
At checkout, the customer types the code in the Promo Code field and clicks Apply. If valid, active, not expired, and not already used by that customer (for one-time codes), the discount is applied and shown in the order summary. The discount is re-validated server-side when the order is placed, so it cannot be bypassed.

---

### 22. Newsletter

**Nav:** Newsletter

**Subscribers list** — every email address that subscribed via the website footer, with sign-up date. Click the delete icon to remove a subscriber.

**Quick Send** — send a simple plain-text email to all subscribers right now. Enter a subject and message body. Each paragraph (separated by a blank line) becomes its own paragraph in the email. Good for quick announcements. For richly formatted campaigns with a poster image and editing history, use Promotional Emails instead.

---

### 23. Promotional Emails

**Nav:** Promo Emails

Create polished, branded promotional emails with an optional poster image. All campaigns are saved so you can edit and resend them later.

**Creating a new campaign:**
1. Click **+ New Email**.
2. **Internal Title** — a label for your own reference only, not shown to subscribers. E.g. "Eid Sale 2025".
3. **Email Subject & Headline** — this becomes both the email's Subject: line and a large bold headline displayed inside the email body.
4. **Poster Image** (optional) — click the upload area to choose an image (JPG, PNG, or WebP). It is displayed full-width at the top of the email above the headline. After uploading you can **Change image** or **Remove poster** at any time.
5. **Message** — the body text. Start a new line for a new paragraph. Plain text only — email branding and design are applied automatically.
6. Choose an action:
   - **Save as Draft** — saves without sending. You can come back and edit it later.
   - **Send to All Subscribers** — saves and immediately delivers the email to every newsletter subscriber.

**Editing and resending:**
All past campaigns appear in the table below the form. Click **Edit & Resend** on any campaign to load it into the form, make changes, and send the updated version to all current subscribers. The sent date and recipient count are updated each time.

**Status column:**
- **Draft** — saved, not yet sent.
- **Sent** — shows the delivery date and the number of subscribers it was sent to.

---

### 24. Email Templates

**Nav:** Email Templates

Customise the subject line and message body of every automatic email the store sends. The email design (colours, store logo, branding, footer) is fixed — only the text you write here changes.

**Email types:**

| Template | When it is sent |
|----------|-----------------|
| Welcome / Sign Up | When a customer creates an account |
| Order Received | Immediately after an order is placed |
| Order Confirmed | When you confirm an order (full invoice included automatically) |
| Order Packed | When you mark an order as Packed |
| Order Shipped | When you mark an order as Shipped (tracking info included if set) |
| Out for Delivery | When an order is Out for Delivery |
| Order Delivered | When an order is marked Delivered |
| Order Cancelled | When an order is Cancelled |
| Order Returned | When a return is processed |
| Review Reminder | Auto-sent 2 weeks after delivery (product list with review links included) |

**Editing a template:**
1. Click the email type in the left panel.
2. Edit the **Subject Line** and **Message Body** in the right panel.
3. Use placeholders from the yellow reference panel to insert dynamic values — the system replaces them with real data when the email is sent:
   - `{{name}}` — the customer's name
   - `{{order_id}}` — the order number
   - `{{tracking_number}}` — courier tracking number (shipped email only)
   - `{{courier}}` — courier name (shipped email only)
4. Click **Save Template**. From the next send onwards, the email uses your new text.

**Example subject line:** `Hi {{name}}, your order #{{order_id}} is confirmed ✓`

---

### 25. Hero Banners

**Nav:** Hero Banners

Controls the main visual section on the homepage.

**Main slider (left, large):**
Each slide has:
- **Image** — upload a landscape banner image (recommended around 1200 × 500 px).
- **Tagline** — small text above the heading (e.g. "New Arrival" or "Limited Time").
- **Title** — the main large heading displayed on the banner.
- **Description** — one or two lines of supporting text.
- **Button Label** and **Button Link** — the CTA button text and where it goes.
- **Active toggle** — inactive slides are skipped in the rotation.

Click **Add Slide** to add more slides. Drag to reorder.

**Side banners (right, two stacked):**
Same fields as slides but designed for a narrower column. Typically used for secondary promotions (e.g. "New Gaming Gear" and "Best Sellers").

Click **Save Banners** to publish all changes.

---

### 26. Announcement Bar

**Nav:** Announcement Bar

A scrolling ticker across the very top of the website, above the header.

- **Enable** — toggle to show or hide the bar entirely.
- **Text** — the scrolling content. Use ` | ` to visually separate multiple messages (e.g. `Free delivery over Rs. 5,000 | Mon–Sat: 11 AM – 8 PM`).
- **Background Color** — hex colour for the bar (e.g. `#c62828` for red).
- **Text Color** — hex colour for the text (e.g. `#ffffff` for white).
- **Scroll Speed** — controls how fast the text moves. Higher = faster.

Click **Save**.

---

### 27. Currency Settings

**Nav:** Currency

Control which currencies customers can switch between on the website. A currency picker appears in the header when more than one currency is enabled.

- Toggle each currency on or off (PKR, USD, GBP, AED, etc.).
- PKR is the base currency. Other currencies use live exchange rate conversion.
- At least one currency must remain enabled.

Click **Save**.

---

### 28. Shipping Settings

**Nav:** Shipping

Set the flat shipping fee added to every order at checkout.

- **Flat Shipping Fee (PKR)** — enter the amount, e.g. 1800.
- The same amount is added to every order regardless of order size or location.
- Set to 0 to offer free shipping on all orders.

Click **Save**.

---

### 29. Courier Settings

**Nav:** Courier

Configure how tracking links are built and optionally connect a courier API.

- **Provider Name** — displayed to customers in emails and on their account page (e.g. "Leopards Courier").
- **Tracking URL Template** — the URL pattern for tracking links. Use `{tracking_number}` as the placeholder (e.g. `https://leopardscourier.com/tracking/{tracking_number}`). When you enter a tracking number on an order, the system builds this URL and uses it for the Track Package button.
- **API Key / Password** — for direct courier API integration if your courier supports it.
- **Enabled** — toggle the courier integration on or off.

Click **Save**.

---

### 30. Payments

**Nav:** Payments

Enable and configure the payment methods available at checkout. Only enabled methods appear to customers.

**Cash on Delivery:**
- Toggle Enabled.
- Optionally enter delivery instructions shown at checkout.

**Bank Transfer, JazzCash, EasyPaisa (manual methods):**
- Toggle Enabled.
- Fill in the Label (shown to customers), account title, account number, and instructions. These are displayed at checkout so customers know where to send payment.
- Customers enter a payment reference number (their transaction ID) when placing the order.

**Safepay (online card payments):**
- Toggle Enabled.
- Enter your **API Key** and **Secret Key** from your Safepay merchant dashboard.
- Toggle **Sandbox** on for testing, off for live production payments.
- When enabled, customers who choose Safepay are redirected to a hosted payment page and returned to the store after completing payment.

Click **Save** for each section.

---

### 31. About Us Page

**Nav:** About Us Page

Controls the content displayed at `/about-us`.

- **Paragraphs** — the main body text. Click Add Paragraph to add more, click Remove to delete one. Write freely about the store's history, mission, etc.
- **Highlights** — four tiles below the text, each with a Title and a Description. Typically used for trust signals like "100% Genuine Products" or "Nationwide Delivery".
- **Store Address** — shown on the About page.
- **Store Timings** — opening hours text shown on the About page.

Click **Save**.

---

### 32. Footer / Store Info

**Nav:** Footer / Store Info

Controls the website footer and the `/contact` page. Both pull from this single source of truth — editing here updates both automatically.

- **Store Description** — short tagline shown under the logo in the footer.
- **Address** — physical store address.
- **Phone** — phone number(s). Use ` | ` to list multiple numbers.
- **Email** — contact email.
- **Store Hours** — opening hours text (shown in the footer, contact page, and can be included in the marquee bar).
- **Social Links** — paste full URLs for Facebook, Twitter/X, Instagram, YouTube, WhatsApp, and TikTok. Leave a field blank to hide that social icon.
- **Footer Link Columns** — three columns of links in the footer. Each column has a heading and a list of links (Label + URL). Add, remove, or reorder links within each column.
- **Marquee Messages** — the scrolling text bar inside the footer. Each line is a separate scrolling message. Add or remove lines as needed.

Click **Save**.

---

### 33. Policies Page

**Nav:** Policies Page

Controls the Return & Exchange Policy page at `/return-exchange`.

- **Page Title** — the heading shown at the top of the page.
- **Sections** — each section has a Heading and Body paragraph. Click Add Section, remove, or drag to reorder.

Click **Save**.

---

### 34. Privacy Policy Page

**Nav:** Privacy Policy Page

Controls the Privacy Policy at `/privacy-policy`. Same structure as the Policies page.

- **Page Title** — heading at the top.
- **Sections** — each with a Heading and Body.

Click **Save**.

---

### 35. Profile

**Nav:** Profile

Update the admin account's own details.

- **Name** — display name shown in the sidebar.
- **Email** — the login email address.
- **Change Password** — enter the current password, then the new password (minimum 8 characters).

Save each section separately.

---

## Automatic Emails — Full Reference

The following emails go out automatically with no manual action required. All are customisable in Admin → Email Templates.

| Event | Email sent to customer |
|-------|------------------------|
| Account created | Email verification link |
| Order placed | Order received confirmation with order summary |
| Order → Confirmed | Confirmed notification + full inline invoice |
| Order → Packed | Packed notification |
| Order → Shipped | Shipped notification with tracking number and courier link |
| Order → Out for Delivery | Out for delivery notification |
| Order → Delivered | Delivered notification |
| Order → Cancelled | Cancellation notification |
| Order → Returned | Return processed notification |
| 14 days after Delivered | Review reminder with links to review each purchased product |

All emails use your store name and branding automatically. To customise the subject or message for any of them, go to Admin → Email Templates, select the type, edit, and save.

---

## Quick Reference — Admin Navigation

| Nav item | What it manages |
|----------|----------------|
| Dashboard | Store stats and recent orders at a glance |
| Profile | Admin login name, email, and password |
| Currency | Which currencies customers can switch to |
| Shipping | Flat shipping fee charged at checkout |
| Courier | Tracking link template and courier API settings |
| Payments | Payment methods, account details, Safepay keys |
| Discount Codes | Promo codes customers apply at checkout |
| Announcement Bar | Scrolling ticker at the top of the website |
| Hero Banners | Homepage image slider and side banners |
| Products | Full product catalogue — add, edit, delete |
| Bulk Sale | Apply or remove sale pricing on many products at once |
| Categories | Category tree, nav visibility, and filter attributes |
| Orders | All customer orders, status updates, tracking, invoice download |
| Customers | Registered customer list and order history |
| Reviews | Approve or reject customer-submitted reviews |
| About Us Page | Content for the /about-us page |
| Footer / Store Info | Footer content and /contact page data |
| Policies Page | Return & Exchange Policy at /return-exchange |
| Privacy Policy Page | Privacy Policy at /privacy-policy |
| Newsletter | Subscriber list and quick plain-text send |
| Promo Emails | Branded promotional campaigns with poster image |
| Email Templates | Subject and message for every automatic email |