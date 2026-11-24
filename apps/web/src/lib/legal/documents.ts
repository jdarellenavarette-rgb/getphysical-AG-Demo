/**
 * The platform's legal documents, as shown in the Business Suite and linked from the Sodia app.
 *
 * THESE ARE DRAFTS. They describe how the platform actually works today and follow the structure
 * such documents normally have in the Philippines, but they have not been reviewed by a lawyer and
 * are not in force. Text in [square brackets] is a placeholder to be filled in before launch.
 * Change LEGAL_VERSION whenever the meaning of a document changes: a business records the version
 * it accepted (facilities.terms_version).
 */
export const LEGAL_VERSION = "draft-0.1";
export const LEGAL_UPDATED = "23 November 2026";

/** Used throughout; replace before launch. */
const COMPANY = "[Registered company name]";
const CONTACT = "[legal contact email]";
const PRIVACY_CONTACT = "[data protection officer email]";

export interface LegalSection {
  heading: string;
  /** Paragraphs. A string starting with "• " is rendered as a list item. */
  body: string[];
}

export interface LegalDocument {
  slug: "terms" | "privacy" | "business-terms" | "refunds" | "community";
  title: string;
  /** Who it is for, in one line. */
  audience: string;
  summary: string;
  sections: LegalSection[];
}

const terms: LegalDocument = {
  slug: "terms",
  title: "Terms of Service",
  audience: "Everyone who uses the Sodia app or the GetPhysical Business Suite",
  summary:
    "The rules for using GetPhysical: your account, what you can and cannot do, how purchases work, and the limits of our responsibility.",
  sections: [
    {
      heading: "1. Who we are and what this covers",
      body: [
        `GetPhysical is operated by ${COMPANY} ("GetPhysical", "we"). These terms cover the Sodia mobile app and the GetPhysical Business Suite (together, the "Service").`,
        'The Service connects people who train with the gyms, studios, sports clubs, coaches and event organizers that serve them (each a "Business"). Businesses are independent. They are not our employees, agents or partners, and they set their own prices, rules and schedules.',
        "By creating an account or using the Service you agree to these terms and to the Privacy Notice. If you run a Business on the Service, the Business Terms also apply.",
      ],
    },
    {
      heading: "2. Your account",
      body: [
        "• You must be at least 13 years old to have an account. If you are under 18 you need a parent's or guardian's permission, and you cannot make purchases in the Service.",
        "• Give accurate information and keep it up to date. One person, one account.",
        "• Keep your sign-in details to yourself. You are responsible for what happens under your account. Tell us at once if you think someone else has used it.",
        "• We may suspend or close an account that breaks these terms, the Community Rules or the law.",
      ],
    },
    {
      heading: "3. Passes, memberships, bookings and events",
      body: [
        "When you buy a pass or membership, book a court, sign up for an event or become a coach's client, your agreement is with that Business, not with GetPhysical. The Business is responsible for providing what it sold.",
        "A Business may refuse entry or service under its own house rules, for example for safety reasons or if a pass has ended.",
        "Your entry code is personal. Do not share it, copy it or let someone else use it. Each code works once and for a short time.",
        "Whether you can cancel or be refunded is described in the Refund and Cancellation Policy and in the Business's own policy.",
      ],
    },
    {
      heading: "4. Payments",
      body: [
        "Payments are processed by licensed third-party payment providers. We do not store your card or e-wallet details.",
        "The price you see at checkout is the Business's price plus a service fee, shown separately before you pay. The payment is split at the moment it is made: the Business's share goes to the Business and the service fee to GetPhysical. GetPhysical does not hold the Business's money.",
        "Online payments are being introduced in stages. Where a Business cannot yet take payment in the app, you pay the Business directly and these payment terms do not apply to that payment.",
      ],
    },
    {
      heading: "5. Health and safety",
      body: [
        "Exercise carries risk. The Service gives you tools and information; it does not give medical advice. Ask a doctor before starting or changing a training or nutrition programme, especially if you have a health condition.",
        "A coach you connect with through the Service is an independent professional. We do not verify every qualification a coach claims.",
        "A Business may ask you to sign its own waiver before you train or play.",
      ],
    },
    {
      heading: "6. Your content",
      body: [
        "You own what you post: workouts, photos, comments and messages. You give us permission to store it, show it to the people you choose to share it with, and display it within the Service.",
        "You are responsible for what you post. Follow the Community Rules. We may remove content that breaks them.",
      ],
    },
    {
      heading: "7. What you may not do",
      body: [
        "• Use someone else's account, pass or entry code, or let someone use yours.",
        "• Try to get around payment, access controls or membership limits.",
        "• Collect other people's information from the Service, or use the Service to send spam.",
        "• Interfere with the Service, probe it for weaknesses without our written permission, or reverse-engineer it.",
        "• Use the Service for anything unlawful.",
      ],
    },
    {
      heading: "8. Our responsibility",
      body: [
        "We provide the Service with reasonable care, but we do not promise it will always be available or free of errors.",
        "We are not responsible for what a Business does or fails to do, including the quality or safety of its facilities, classes, coaching or events, or for injury, loss or damage at a Business's premises or event.",
        "To the extent the law allows, our total liability to you for any claim about the Service is limited to the service fees you paid us in the twelve months before the claim. Nothing in these terms limits liability that cannot be limited under Philippine law, including your rights under the Consumer Act.",
      ],
    },
    {
      heading: "9. Changes and closing your account",
      body: [
        "We may change the Service or these terms. If a change matters, we will tell you in the app or by email before it takes effect. Continuing to use the Service after that means you accept the change.",
        "You can close your account at any time in Settings. Passes and memberships you bought remain subject to the Business's policy.",
      ],
    },
    {
      heading: "10. Law and contact",
      body: [
        "These terms are governed by the laws of the Republic of the Philippines. Disputes go to the courts of [city], after we have both tried in good faith to settle them directly.",
        `Questions about these terms: ${CONTACT}.`,
      ],
    },
  ],
};

const privacy: LegalDocument = {
  slug: "privacy",
  title: "Privacy Notice",
  audience: "Everyone who uses the Sodia app or the GetPhysical Business Suite",
  summary:
    "What personal information we collect, why, who sees it, how long we keep it, and your rights under the Data Privacy Act of 2012.",
  sections: [
    {
      heading: "1. Who is responsible for your information",
      body: [
        `${COMPANY} decides how and why the information below is used, and is the personal information controller for it under the Data Privacy Act of 2012 (Republic Act No. 10173).`,
        "When a Business brings its own customer list into the Service (for example by importing a spreadsheet or adding a walk-in at the desk), that Business is the controller for that list and we handle it on the Business's instructions.",
        `Our Data Protection Officer can be reached at ${PRIVACY_CONTACT}.`,
      ],
    },
    {
      heading: "2. What we collect",
      body: [
        "• Account details: your name, email address, username, profile photo and date of birth. We use your date of birth to apply age limits.",
        "• Sign-in information: if you use Google or Apple to sign in, we receive your name and email address from them, not your password.",
        "• Training and nutrition records you choose to log: workouts, routes, food and water. This is information about your health, which the law treats as sensitive personal information. We collect it only because you enter it, and only with your consent.",
        "• Location: when you allow it, your approximate location to show nearby venues, and the route of a run or ride you record.",
        "• Memberships and visits: the Businesses you have joined, your passes, and the time of each check-in.",
        "• Purchases: what you bought, when, from which Business and for how much. We do not receive or store your card or e-wallet details; the payment provider does.",
        "• Messages and posts: what you send to a Business or post in the app, and who you follow.",
        "• Technical information: device type, app version and error reports, to keep the Service working and secure.",
      ],
    },
    {
      heading: "3. Why we use it",
      body: [
        "• To provide the Service: your account, your passes, check-in at the door, bookings, events and messages. The basis is our contract with you.",
        "• To show you your own training history and progress. The basis is your consent, which you can withdraw by deleting the records or your account.",
        "• To process payments and keep the records the law requires. The basis is contract and legal obligation.",
        "• To keep the Service safe: preventing fraud, pass sharing and abuse. The basis is our legitimate interest in a secure service.",
        "• To tell you about changes to the Service. We do not sell your information, and we do not use your health information for advertising.",
      ],
    },
    {
      heading: "4. Who sees your information",
      body: [
        "• A Business you join, buy from, book with or sign up to sees your name, username, your standing with it (for example active or lapsed), your visits and bookings there, your purchases from it, and messages you exchange with it. It does not see your activity at other Businesses.",
        "• A coach sees your lift and movement records only after you accept that coach. A coach never sees your food records. You can end the connection at any time and access stops immediately.",
        "• A Business you follow can see that you follow it.",
        "• Other users see your public profile and what you choose to post. A private profile is visible only to followers you approve.",
        "• Service providers who process information for us under contract: database and hosting, email delivery, sign-in, maps, food-database lookup and payment processing. They may use it only to provide that service.",
        "• Authorities, when the law requires it.",
      ],
    },
    {
      heading: "5. Where it is stored and for how long",
      body: [
        "Your information is stored on servers in Singapore and may be processed in other countries by our service providers. We require them to protect it to the standard Philippine law requires.",
        "We keep your information for as long as you have an account. When you delete your account we delete or anonymise your personal information within [30] days, except records we must keep by law, such as records of payments, which we keep for the period the law requires.",
        "Records of sales and door entries are kept in a form that cannot be edited, so that Businesses' accounts stay accurate. When you delete your account these are disconnected from your identity where the law allows.",
      ],
    },
    {
      heading: "6. Your rights",
      body: [
        "Under the Data Privacy Act you have the right to:",
        "• be informed about how your information is used (this notice);",
        "• access the information we hold about you and receive a copy in a commonly used format;",
        "• correct information that is wrong;",
        "• object to a use of your information, or withdraw consent;",
        "• have your information erased or blocked where there is no lawful reason for us to keep it;",
        "• claim damages if you are harmed by inaccurate, unlawfully obtained or unauthorised use of your information;",
        "• complain to the National Privacy Commission.",
        `To use any of these rights, write to ${PRIVACY_CONTACT}. We will answer within [15] working days. In the app you can already mute a Business's broadcasts, leave a Business, end a coach connection, and delete your account.`,
      ],
    },
    {
      heading: "7. Children",
      body: [
        "The Service is not for children under 13, and we do not knowingly collect their information. People aged 13 to 17 may use the Service with a parent's or guardian's permission and cannot make purchases. If you believe a child under 13 has an account, tell us and we will remove it.",
      ],
    },
    {
      heading: "8. Security",
      body: [
        "Access to information is restricted in the database itself, so a Business can only read its own customers and a person can only read their own records. Connections are encrypted, sign-in tokens are stored in the device's secure storage, and entry codes change every minute.",
        "No system is perfectly secure. If a breach is likely to harm you, we will tell you and the National Privacy Commission within the time the law requires.",
      ],
    },
    {
      heading: "9. Changes to this notice",
      body: [
        "If we change how we use your information we will update this notice and tell you in the app before the change takes effect.",
      ],
    },
  ],
};

const businessTerms: LegalDocument = {
  slug: "business-terms",
  title: "Business Terms",
  audience: "Gyms, studios, sports clubs, coaches and event organizers that use the Business Suite",
  summary:
    "The agreement between GetPhysical and a business: what each side is responsible for, fees, how payments are split, and how customer information must be handled.",
  sections: [
    {
      heading: "1. The agreement",
      body: [
        `These terms are between ${COMPANY} ("GetPhysical") and the gym, studio, sports club, coach or event organizer that opens a business profile (the "Business", "you"). They apply together with the Terms of Service and the Privacy Notice.`,
        "The person who accepts these terms confirms they have authority to bind the Business.",
      ],
    },
    {
      heading: "2. What GetPhysical provides",
      body: [
        "A workspace for your kind of business in the Business Suite, a profile in the Sodia app, and the tools described there: member and customer records, check-in, court scheduling, events, client lists, messaging, posts, plans and prices, and sales records.",
        "We may add, change or retire features. We will give reasonable notice before removing a feature you rely on.",
      ],
    },
    {
      heading: "3. Your responsibilities",
      body: [
        "• You are the seller. You provide the passes, memberships, court time, coaching and events you offer, and you are responsible for their quality and safety.",
        "• You hold the licences, permits, registrations and insurance your business needs, and you comply with the law, including consumer, tax and safety law.",
        "• Your prices, descriptions and schedules in the Service are accurate, and you honour what customers buy.",
        "• You publish a refund and cancellation policy that meets at least the minimum in the Refund and Cancellation Policy.",
        "• You control who is on your team and what they can do. You are responsible for their actions in your workspace. Remove access promptly when someone leaves.",
      ],
    },
    {
      heading: "4. Fees",
      body: [
        "Opening a business profile is free. The free plan includes up to 19 members for a sports club and up to 3 clients for a coach. Limits and paid plans are shown in the Business Suite and may change with notice.",
        "For each sale made through the app, a service fee is added on top of your price and paid by the customer: a fixed ₱15 on a one-time pass, and 5% on a membership. You receive your price in full, less any charge your payment provider makes to you directly.",
        "We may change fees with at least 30 days' notice. A change does not apply to sales already made.",
      ],
    },
    {
      heading: "5. Payments and payouts",
      body: [
        "Payments are processed by a licensed third-party payment provider. To take payments you open and verify your own account with that provider and accept its terms.",
        "Each payment is split when it is made: your share is paid to your account with the provider, and the service fee to GetPhysical. GetPhysical does not receive, hold or forward your money, and is not the merchant of record for your sales.",
        "Payout timing, chargebacks and holds are governed by the provider's terms. You are responsible for refunds and chargebacks on your sales.",
        "Online payments are being introduced in stages. Until they are switched on for your business, the Service records what you sell but does not collect money for you, and section 4's service fees do not apply.",
      ],
    },
    {
      heading: "6. Customer information",
      body: [
        "For information your customers give to GetPhysical through the app, GetPhysical is the personal information controller and shares with you what you need to serve them, as described in the Privacy Notice.",
        "For information you bring in yourself, such as an imported customer list or a walk-in you add at the desk, you are the controller and GetPhysical processes it on your instructions. You confirm you are entitled to hold and upload it.",
        "You use customer information only to serve those customers at your business. You do not sell it, export it for unrelated marketing, or use it to contact people who have left your business or muted your messages, except where the law requires.",
        "A coach sees a client's training records only while the client has accepted that coach.",
        "You tell us without delay if you become aware of unauthorised access to your workspace or to customer information.",
      ],
    },
    {
      heading: "7. Messages and posts",
      body: [
        "Messages, broadcasts and posts you send must be relevant to your business and follow the Community Rules. People can mute your broadcasts and unfollow you; you must respect that.",
      ],
    },
    {
      heading: "8. Records",
      body: [
        "Sales and door-entry records cannot be edited or deleted. Corrections are made by a reversing entry. This protects you and your customers, and it means a mistake stays visible alongside its correction.",
      ],
    },
    {
      heading: "9. Suspension and ending the agreement",
      body: [
        "You can stop using the Service at any time. Before you close a business profile, honour or refund what your customers have bought.",
        "We may suspend or close a business profile that breaks these terms, puts customers at risk, or is used unlawfully. Where we can, we will warn you and give you a chance to put it right.",
        "When the agreement ends you can export your sales records. We keep records the law requires us to keep.",
        "An owner may hand the business profile to another member of its team. From then on that person is responsible for it under these terms.",
      ],
    },
    {
      heading: "10. Liability",
      body: [
        "Each side is responsible for its own acts and omissions. You will cover GetPhysical's losses from claims by your customers about what you sold or did.",
        "To the extent the law allows, GetPhysical's total liability to you is limited to the service fees GetPhysical received from your sales in the twelve months before the claim.",
        "These terms are governed by the laws of the Republic of the Philippines.",
        `Questions: ${CONTACT}.`,
      ],
    },
  ],
};

const refunds: LegalDocument = {
  slug: "refunds",
  title: "Refund and Cancellation Policy",
  audience: "Anyone who buys in the Sodia app, and every business that sells there",
  summary:
    "When you can cancel or get your money back, who decides, and how a refund is made. Businesses may be more generous than this, never less.",
  sections: [
    {
      heading: "1. Who you bought from",
      body: [
        "You buy from the Business, and the Business decides refunds within the rules below. GetPhysical provides the tools and makes sure the minimum rules are followed.",
      ],
    },
    {
      heading: "2. Minimum rules every Business follows",
      body: [
        "• Charged by mistake, or charged twice: refunded in full.",
        "• The Business cancels a class, booking or event, or closes for the period you paid for: refunded in full for what you did not receive, or moved to another date if you agree.",
        "• The Business cannot provide what it sold: refunded in full.",
        "• A pass or membership you have not used at all, cancelled within 24 hours of buying it: refunded in full.",
      ],
    },
    {
      heading: "3. Where the Business decides",
      body: [
        "• A pass or membership you have already used.",
        "• A change of mind after 24 hours.",
        "• Late cancellation of a booking, or not turning up.",
        "• Pausing or transferring a membership.",
        "Each Business's own policy is shown before you pay. Ask the Business first; it can usually answer fastest.",
      ],
    },
    {
      heading: "4. The service fee",
      body: [
        "When a purchase is refunded in full under section 2, the service fee is refunded too. For other refunds, the service fee is refunded only if the Business refunds the whole purchase.",
      ],
    },
    {
      heading: "5. How a refund is made",
      body: [
        "A refund goes back to the payment method you used. How long it takes to appear depends on your bank or e-wallet, usually [5 to 10] working days.",
        "A refund ends the pass or membership it relates to, and door access with it.",
        "The original sale is never erased from the record. A refund is recorded as a separate reversing entry, so both you and the Business can see what happened.",
      ],
    },
    {
      heading: "6. If you cannot agree",
      body: [
        `If you and the Business cannot agree, write to ${CONTACT} with the purchase details. We will look at the record and help where these rules apply. Nothing here limits your rights under the Consumer Act of the Philippines.`,
      ],
    },
  ],
};

const community: LegalDocument = {
  slug: "community",
  title: "Community Rules",
  audience: "Everyone who posts, comments or messages on the Service",
  summary: "What is and is not acceptable in posts, comments, messages and business broadcasts.",
  sections: [
    {
      heading: "1. Be someone people want to train with",
      body: [
        "The Service is for training, playing and competing together. Encourage people. Disagree without attacking. Remember that beginners are reading.",
      ],
    },
    {
      heading: "2. Not allowed",
      body: [
        "• Harassment, threats, hate speech, or targeting someone for their body, sex, gender, race, religion, disability or age.",
        "• Sexual content, or any content that sexualises minors.",
        "• Promoting dangerous practices: extreme dieting, unsafe weight cutting, or banned or prescription-only substances.",
        "• False health claims, or advice presented as medical advice.",
        "• Sharing someone else's private information, photos or training records without their permission.",
        "• Impersonating a person or a business.",
        "• Spam, scams, or selling things unrelated to training and sport.",
        "• Cheating: false records, altered results, or sharing entry codes.",
      ],
    },
    {
      heading: "3. For businesses",
      body: [
        "• Posts and broadcasts are about your business and what you offer. Be accurate about prices, places left and results.",
        "• Do not message people who have left your business or muted you.",
        "• Do not post customers' photos, results or progress without their agreement.",
      ],
    },
    {
      heading: "4. Reporting and what happens next",
      body: [
        "Report a post, message or account from its menu in the app. We review reports and may remove content, limit an account, or close it. Serious matters may be passed to the authorities.",
        `If you think we got a decision wrong, write to ${CONTACT} and a person will look at it again.`,
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS: LegalDocument[] = [terms, privacy, businessTerms, refunds, community];

export function findLegalDocument(slug: string): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find((document) => document.slug === slug);
}
