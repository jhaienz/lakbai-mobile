# LAKBAI PROJECT DOCUMENTATION
## Simplified & Structured Format

---

## TABLE OF CONTENTS
1. Overview/Introduction
2. Problem Definition
3. Solution Design
4. Architecture
5. Business Model
6. Feasibility & Scalability
7. Conclusion

---

# 1. OVERVIEW/INTRODUCTION

## 1.1 Project Information
- **Project Name:** LAKBAI
- **Subtitle:** AI-Powered Tourism Redistribution Platform
- **Vision:** Connecting tourists with authentic local experiences and empowering small businesses through intelligent travel recommendations

## 1.2 What LAKBAI Does
LAKBAI is a tourism redistribution platform that:
- **For Tourists:** Get AI-generated personalized itineraries based on preferences
- **For Local Businesses:** List themselves and gain visibility to tourists
- **For LGUs (Local Government Units):** Add tourist spots and verify local businesses

## 1.3 Technology Stack
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend Framework | NestJS (TypeScript) | API development |
| Data Storage | JSON flat-file | MVP-phase storage |
| AI/Intelligence | Google Gemini 1.5 Flash API | Itinerary generation |
| Frontend | React Native or Flutter | Mobile application |
| Authentication | Simple (userId in request body) | MVP-phase auth |
| Deployment | Cloud-ready | Scalable infrastructure |

## 1.4 Key Features
- ✅ AI-generated personalized itineraries
- ✅ Transport budget estimation & breakdown
- ✅ Point-to-point fare checker
- ✅ Business verification system
- ✅ Tourist spot management by LGUs
- ✅ Review & rating system
- ✅ Local business recommendations

## 1.5 Stakeholders & Roles
- **Tourists:** End users seeking travel experiences
- **Local Businesses:** SMEs seeking visibility and customers
- **LGUs:** Local governments managing tourism in their regions
- **Development Team:** Backend (Laptop 1), Design & Concept (Laptop 2)

---

# 2. PROBLEM DEFINITION

## 2.1 Core Problems Addressed

**Problem 1: Tourism Concentration**
- Tourism traffic heavily concentrated in major cities
- Lesser-known regions with rich heritage struggle for tourist attention
- Unequal tourism revenue distribution

**Problem 2: Limited Discovery Options**
- Tourists rely on generic guidebooks and mainstream tours
- Difficult to find authentic, local experiences personalized to preferences
- No smart recommendation system based on individual interests

**Problem 3: SME Visibility Gap**
- Small local businesses lack digital presence
- Difficulty competing with established tour operators
- Limited access to tourist market

## 2.2 Target Users
- **Primary:** Tourists aged 18-55 interested in authentic experiences
- **Secondary:** Small to medium local businesses (restaurants, accommodations, activities)
- **Tertiary:** Local government units seeking tourism growth

## 2.3 Market Opportunity
- **Target Region:** Albay, Philippines (500,000+ annual tourists)
- **Expansion Potential:** ASEAN region with 140M+ annual tourists
- **Untapped Market:** Secondary destinations with 80% of tourism potential untapped

---

# 3. SOLUTION DESIGN

## 3.1 Solution Overview
LAKBAI solves problems through three interconnected user flows:

1. **AI-Powered Itinerary Generation** → Tourists get personalized day plans based on interests, budget, and mobility
2. **Local Business Integration** → Small businesses get direct visibility to tourists
3. **LGU Verification & Control** → Local governments verify quality and manage tourist attractions

## 3.2 User Flows

### Tourist Journey
```
1. Register → Select interests, budget, mobility, duration
2. Home Screen → Tap "Generate Itinerary"
3. View Itinerary → Hour-by-hour timeline with stops
4. Transport Info → See estimated costs & "Check a fare" modal
5. Explore Details → Tap any stop for full information & reviews
6. Experience & Review → Leave ratings & feedback
```

### Business Owner Journey
```
1. Register → As "business" user type
2. Create Listing → Add business details, location, hours
3. Await Verification → LGU reviews and verifies
4. Gain Visibility → Appears in AI-generated itineraries
5. Receive Customers → Tourists book or visit
6. Build Reputation → Accumulate reviews & ratings
```

### LGU Journey
```
1. Register → As "lgu" user type
2. Add Spots → Create tourist attractions/heritage sites
3. Verify Businesses → Review and approve business listings
4. Manage Tourism → Control tourist spot information
5. Monitor Activity → Track visitor patterns & spending
```

## 3.3 Core Features & Functionalities

| Feature | Description | User(s) |
|---------|-------------|---------|
| **User Registration** | Simple registration with preferences | All users |
| **AI Itinerary** | Gemini-powered day plan generation | Tourists |
| **Transport Budget** | Estimated costs for full itinerary | Tourists |
| **Fare Checker** | Point-to-point transport cost lookup | Tourists |
| **Business Listing** | CRUD operations for local businesses | Business owners |
| **Business Verification** | LGU approval of business legitimacy | LGUs |
| **Tourist Spots** | LGU-managed attraction listings | LGUs |
| **Reviews & Ratings** | Tourist feedback on experiences | Tourists |
| **Transport Estimation** | Real-time local transport options | System |

## 3.4 Data Models

### User Model
```
{
  id: unique identifier
  name: user name
  type: "tourist" | "business" | "lgu"
  preferences: {
    interests: array of interests
    budget: "budget" | "mid" | "luxury"
    mobility: "walking" | "vehicle"
    duration: number of days
  }
}
```
**Data Files:**
- `users.json` - All user profiles & preferences
- `businesses.json` - Business listings with verification status
- `spots.json` - Tourist attractions & heritage sites
- `reviews.json` - User reviews & ratings

---

# 4. ARCHITECTURE

## 4.1 System Architecture

### Technology Stack (Laptop 1 - Backend)

**Backend API**
- Framework: NestJS (TypeScript)
- Base URL: http://localhost:3000
- Authentication: Simple (userId in request body for MVP)
- Data: JSON flat-file storage
- Port: 3000

**Modules & Components**
```
NestJS Backend
├── Users Module (Registration, preferences)
├── Business Module (CRUD, verification)
├── Spots Module (CRUD, attraction management)
├── Itinerary Module (AI integration, transport calculation)
└── DataService (JSON file read/write)
```

**AI Integration**
- Provider: Google Gemini 1.5 Flash API
- Purpose: Itinerary generation & transport budget estimation
- Rate Limit: 15 requests/min, 1M tokens/day (free tier)
- Setup: Requires GEMINI_API_KEY in .env

### Technology Stack (Laptop 2 - Design/Concept)

**Design & Mockups**
- Tool: Google Stitch
- Mockup Reference: [Link to Stitch project]
- Design System: [To be created]
- Frontend Framework: React Native or Flutter (for future coding)

**Design Deliverables**
- UI Screen mockups
- User flow diagrams
- Design system & components
- Brand identity (logo, colors, typography)

## 4.2 API Endpoints

### Users / Onboarding
**POST /users/register** - Register new user with preferences
- Request: name, type, preferences (interests, budget, mobility, duration)
- Response: user object with generated ID

**GET /users/:id** - Retrieve user profile
- Response: user profile & preferences

**PUT /users/:id/preferences** - Update preferences
- Request: updated interests, budget, mobility, duration
- Response: updated user object

### Itinerary Generation
**POST /itinerary/generate** - Generate AI itinerary
- Request: userId
- Response: Day plan with stops, transport legs, cost summary, tips

**POST /itinerary/transport-budget** - Point-to-point fare checker
- Request: from location, to location, mobility preference
- Response: Transport options with costs & duration

### Businesses
**POST /businesses** - Create business listing
- Request: name, category, description, location, hours
- Response: business object with ID

**GET /businesses** - List all verified businesses
- Response: Array of verified businesses

**PUT /businesses/:id/verify** - LGU verifies business
- Request: lguId
- Response: Updated business with verified=true

### Tourist Spots
**POST /spots** - LGU adds new tourist spot
- Request: name, description, location, category, best time, duration
- Response: spot object with ID

**GET /spots** - List all tourist spots
- Response: Array of all spots

### Reviews
**POST /reviews** - User leaves review
- Request: spotId, userId, rating, comment
- Response: review object

**GET /spots/:id/reviews** - Get spot reviews
- Response: Array of reviews for spot

## 4.3 Application Screens

### Tourist Screens
1. **Splash Screen** - App launch & branding
2. **Onboarding Screen** - Interest, budget, mobility, duration selection
3. **Home Screen** - Main menu with "Generate Itinerary" button
4. **Itinerary Screen** - Timeline view of day plan
   - Transport Budget Card with estimated costs
   - "Check a fare" button for point-to-point lookup
5. **Business Detail Screen** - Full info on selected business/spot
6. **Reviews Screen** - Ratings and comments from other tourists

### Business Owner Screens
1. **Registration Screen** - Sign up as business owner
2. **My Listing Screen** - View own business listing
3. **Edit Business Form** - Add/modify business information
4. **Status Screen** - Pending/Verified status display

### LGU Screens
1. **Registration Screen** - Sign up as LGU
2. **LGU Dashboard** - Overview of tourism data
3. **Add Spot Form** - Create new tourist attraction
4. **Pending Businesses List** - Review & verify businesses

## 4.4 Folder Structure
```
LAKBAI/
├── backend/                    # Laptop 1 - Claude Code
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── data/
│   │   │   ├── data.service.ts
│   │   │   └── store/
│   │   │       ├── users.json
│   │   │       ├── businesses.json
│   │   │       ├── spots.json
│   │   │       └── reviews.json
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── business/
│   │   │   ├── business.controller.ts
│   │   │   ├── business.service.ts
│   │   │   └── business.module.ts
│   │   ├── spots/
│   │   │   ├── spots.controller.ts
│   │   │   ├── spots.service.ts
│   │   │   └── spots.module.ts
│   │   ├── itinerary/
│   │   │   ├── itinerary.controller.ts
│   │   │   ├── itinerary.service.ts
│   │   │   └── itinerary.module.ts
│   │   └── reviews/
│   │       ├── reviews.controller.ts
│   │       ├── reviews.service.ts
│   │       └── reviews.module.ts
│   ├── package.json
│   ├── .env
│   └── tsconfig.json
├── frontend/                   # Laptop 2 - Design Concepts
│   ├── stitch-mockups/        # Google Stitch design files
│   ├── design-system/         # UI components, colors, fonts
│   ├── user-flows/            # Journey diagrams
│   └── assets/                # Logos, icons, images
└── documentation/             # This document
```

---

# 5. BUSINESS MODEL

## 5.1 Revenue Streams (Future)

**For MVP Phase:**
- No revenue collection - focus on user validation

**Future Revenue (Post-MVP):**
1. **Commission Model** - 5-10% commission on bookings made through platform
2. **Premium Listings** - Featured/promoted business listings
3. **Analytics Dashboard** - B2B insights for LGUs & businesses
4. **Sponsored Spots** - Featured tourist attractions

## 5.2 User Acquisition Strategy

### Tourists
- Hotel lobby information kiosks & QR codes
- Tourism information centers
- Travel blogs & influencer partnerships
- Social media marketing (Instagram, TikTok)
- Partnership with airlines & travel agencies

### Local Businesses
- Direct outreach to verified SMEs
- Business associations & cooperatives
- Tourism board partnerships
- Word-of-mouth & referrals

### LGUs
- Direct partnership with local government offices
- Regional tourism boards
- Government innovation programs
- Co-marketing initiatives

## 5.3 Cost Structure (Year 1 MVP)

| Cost Category | Estimated Amount | Notes |
|--------------|-----------------|-------|
| Development Team | $40,000-60,000 | 4 developers, 1 designer, 1 PM |
| Infrastructure | $5,000-10,000 | Cloud hosting, APIs, services |
| Tools & Licenses | $2,000-5,000 | Software, design tools |
| Marketing | $5,000-10,000 | Initial user acquisition |
| Operations | $5,000-10,000 | Contingency, miscellaneous |
| **TOTAL** | **$57,000-95,000** | |

---

# 6. FEASIBILITY & SCALABILITY

## 6.1 Technical Feasibility

**Backend (Laptop 1 - Claude Code):** ✅ FEASIBLE
- NestJS is production-ready for MVPs
- JSON flat-file storage sufficient for MVP scale (1000s of records)
- Gemini API is well-documented and easy to integrate
- TypeScript provides type safety

**Frontend (Laptop 2 - Design):** ✅ FEASIBLE
- Google Stitch provides rapid mockup capabilities
- React Native allows single codebase for iOS/Android
- Design-first approach before coding reduces rework

**Technical Risks & Mitigation**
| Risk | Mitigation |
|------|-----------|
| Gemini API rate limits | Cache results, implement queuing |
| JSON file scaling | Migrate to PostgreSQL post-MVP |
| Authentication gaps | Add JWT in Phase 2 |

## 6.2 Development Timeline

**Phase 1: MVP Build** - 6-8 weeks
- Backend: Users, businesses, spots, itinerary modules
- Frontend mockups: All key screens in Google Stitch
- Testing & bug fixes
- Output: Functional MVP with 50+ local businesses

**Phase 2: Pilot Testing** - 4 weeks
- Recruit 200+ local businesses in Albay
- Beta test with 500 tourists
- Gather feedback & iterate
- Output: Refined platform with real data

**Phase 3: Regional Launch** - 4-6 weeks
- Expand to 2-3 additional regions
- Onboard 1,000+ businesses
- Build LGU partnerships
- Output: Multi-region operational platform

## 6.3 Resource Requirements

**Team**
- 2 Full-Stack Backend Developers (Laptop 1)
- 1 UI/UX Designer (Laptop 2 - Stitch mockups)
- 1 Product Manager
- 1 QA Tester

**Infrastructure**
- Laptop 1: Development laptop (Backend coding)
- Laptop 2: Design laptop (Google Stitch, Gemini)
- Cloud service (GCP recommended for Gemini integration)
- Collaboration tools (Git, Slack, Jira)

**Licenses & Services**
- Google Cloud account (with Gemini API quota)
- Google Stitch (design mockups)
- Development tools & libraries (free/open-source where possible)

## 6.4 Scalability Considerations

**User Growth**
- Expected Year 1: 1,000-5,000 tourists
- Expected Year 2: 25,000+ tourists
- Expected Year 3: 100,000+ tourists

**Data Growth**
- Database migration path: JSON → PostgreSQL → Distributed database
- File storage: Cloud storage (GCS) for images/assets
- Caching strategy: Redis for frequently accessed data

**Infrastructure Scaling**
- API auto-scaling: Kubernetes-ready NestJS deployment
- Load balancing: Distribute traffic across multiple instances
- CDN: Use CDN for static assets & images
- Database: Sharding strategy for large datasets

**Organizational Growth**
- Start: 4 person team
- Year 1: 8-10 people (add marketing, customer success)
- Year 2+: Scale to 20+ people with regional teams

## 6.5 Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Low tourist adoption | Medium | High | Influencer partnerships, good UX |
| Business verification delays | Medium | Medium | Clear LGU SLAs, automated workflows |
| Gemini API changes | Low | Medium | Multiple AI provider evaluation |
| Data privacy concerns | Low | High | GDPR-compliant architecture |
| Regional competition | Low | Medium | First-mover advantage, quality focus |

## 6.6 MVP Scope (What's Included vs Excluded)

### ✅ Included in MVP
- User registration & preferences
- AI itinerary generation (Gemini)
- Transport budget calculation
- Point-to-point fare checker
- Business listing & verification
- Tourist spot management
- Review system

### ❌ Not Included (Future Phases)
- JWT authentication (use userId in body for MVP)
- Image uploads (placeholder URLs)
- Real-time crowd data
- Multi-day itineraries (1 day only)
- Map view (show lat/lng as text)
- Payment integration
- Real-time LTFRB API (use Gemini estimates)

---

# 7. CONCLUSION

## 7.1 Summary
LAKBAI is a feasible, high-impact tourism platform addressing real market gaps. By combining AI recommendations, local business empowerment, and LGU partnerships, it creates a win-win ecosystem. The MVP is achievable in 6-8 weeks with a small team, using proven technologies (NestJS, Gemini, React Native) and rapid design iteration (Google Stitch).

## 7.2 Key Success Factors
1. **Fast MVP delivery** - Get to market in 6-8 weeks
2. **Strong UX** - Intuitive onboarding & itinerary design
3. **LGU partnerships** - Government support is key differentiator
4. **Quality content** - Well-curated business & spot listings
5. **Continuous iteration** - Regular updates based on user feedback

## 7.3 Expected Impact

**Economic Impact**
- Tourism revenue redistribution to secondary regions
- 40-50% average revenue increase for verified businesses
- 100+ jobs created per region in tourism sector

**User Impact**
- Tourists get personalized, authentic experiences
- Small businesses gain market access
- Communities benefit from tourism growth

## 7.4 Next Steps

**Immediate (Week 1)**
- [ ] Set up development environment (Laptop 1 & 2)
- [ ] Create NestJS project & basic structure
- [ ] Begin Google Stitch mockup design
- [ ] Establish LGU partnership (Albay)

**Short-term (Weeks 2-4)**
- [ ] Complete backend API (Users, Businesses, Spots)
- [ ] Integrate Gemini AI for itinerary generation
- [ ] Complete frontend mockups (all screens)
- [ ] Build transport budget calculator

**Medium-term (Weeks 5-8)**
- [ ] Full system testing & bug fixes
- [ ] UI polish & optimization
- [ ] Recruit pilot businesses & LGU testers
- [ ] Prepare demo & launch

## 7.5 Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| MVP completion | Feature-complete | Week 8 |
| Pilot businesses | 50+ verified | Week 10 |
| Pilot users | 500 beta testers | Week 12 |
| User satisfaction | 4.0+ stars | Week 12 |
| Generated itineraries | 1,000+ | Week 12 |

---

## APPROVAL & SIGN-OFF

**Project Lead:** _________________ Date: __________

**Technical Lead (Backend):** _________________ Date: __________

**Design Lead (Frontend):** _________________ Date: __________

**Product Manager:** _________________ Date: __________

---

## QUICK REFERENCE LINKS

**Development**
- GitHub Repository: [To be added]
- Backend Port: localhost:3000
- Gemini API: [aistudio.google.com](https://aistudio.google.com)

**Design**
- Google Stitch Mockups: [Link to project]
- Design System: [To be created]

**Documentation**
- API Reference: See Section 4.2
- Data Models: See Section 3.4
- Setup Instructions: See Frontend Screen Map (Section 4.3)

**Resources**
- NestJS Docs: [nestjs.com](https://nestjs.com)
- Gemini API: [ai.google.dev](https://ai.google.dev)
- React Native: [reactnative.dev](https://reactnative.dev)

---

**END OF DOCUMENTATION**

