# Human Submission Checklist — WrenchTruth (`AI OpenBuild`)

> Per `AGENTS.md` Rule #2: **Humans handle registration, login, form filling, and clicking Submit.** All fields and media assets are pre-packaged and verified below so you can complete the submission in ~3 minutes.

---

## Step-by-Step Devpost Submission Guide

1. **Open the Hackathon Page**:
   - Visit `https://ai-openbuild.devpost.com/` and click **Join hackathon** / **Start a submission** (logged into your Devpost account).
2. **Project Name & Elevator Pitch (`Manage team` / `Project overview`)**:
   - **Project name**: Copy `WrenchTruth` from `submission/fields.md` Section 1.
   - **Elevator pitch**: Copy the 191-character pitch from `submission/fields.md` Section 2.
   - **Thumbnail**: Upload `/home/yap/Hack/ai-openbuild/submission/assets/thumbnail.png` (`1200×800`, 3:2 PNG, 110 KB).
3. **Project Details (`About the project` & `Built with`)**:
   - **About the project**: Copy the entire Markdown block from `submission/fields.md` Section 4.
   - Update the single `TODO(human)` line at the bottom (`## Team`) with your name / Devpost handle.
   - **Built with**: Paste the tags from `submission/fields.md` Section 5:
     `react, typescript, tailwindcss, vite, vercel, nhtsa-api, obd2, automotive, playwright, vitest, node.js`
4. **Links (`"Try it out" links`)**:
   - Add link 1: `https://ai-openbuild.vercel.app`
   - Add link 2: `https://github.com/Georgefifth/ai-openbuild`
5. **Media (`Image gallery` & `Video`)**:
   - Upload the 5 gallery PNGs from `/home/yap/Hack/ai-openbuild/submission/assets/gallery-01-*.png` through `gallery-05-*.png` and paste each corresponding <= 150-char caption from `submission/fields.md` Section 7.
   - Upload `/home/yap/Hack/ai-openbuild/submission/assets/demo.mp4` (`1920×1080`, 68.8s, 9.2 MB) to YouTube (Public or Unlisted) or Vimeo, and paste the video link into Devpost's **Video demo link** field.
6. **Review & Submit**:
   - Preview the rendered Markdown on Devpost, accept the official rules, and click **Submit project**.

---

## Pre-Submission Verification Checklist

- [x] **Project Name**: `WrenchTruth` (concise, unique, matches UI & repo).
- [x] **Elevator Pitch**: `191 / 200` characters (under the 200-char limit).
- [x] **Thumbnail (`submission/assets/thumbnail.png`)**: Custom-generated `1200×800` (exact 3:2 ratio) PNG, `110 KB` (< 5 MB limit), not a plain screenshot crop.
- [x] **About the Project Markdown**:
  - Uses standard `##` and `###` Markdown headings (no HTML heading tags).
  - Plain-text formulas wrapped in backticks (no fragile LaTeX rendering dependencies).
  - Satisfies all 6 **AI OpenBuild** required submission checklist items (Explain the idea, Show the AI + representative inputs/outputs, Demonstrate build, Document stack & pre-existing open-source vs. event work, Include limitations & testing, List team).
  - Every metric (`$2,840.50` / `71%` saved, `6.6` duplicate hours cut, `20/20` / `100%` Stage 3.5 real-world validation vs. `20%` baseline, `12/12` Playwright Firefox QA scenarios) is backed by repository evidence.
- [x] **Gallery Images (`submission/assets/gallery-01..05.png`)**: 5 PNGs at `1500×1000` (exact 3:2 ratio), `326 KB – 441 KB` each (< 5 MB limit), each paired with an English caption <= 150 characters (`124–131` chars).
- [x] **Demo Video (`submission/assets/demo.mp4`)**: `1920×1080` @ `30 fps` H.264 + AAC (`68.8s`, `9.2 MB`), fact-validated and frame-inspected.
- [x] **Public Links Verified Accessible (HTTP 200 & Zero Secrets)**:
  - Live App: `https://ai-openbuild.vercel.app` (HTTP 200 OK)
  - Live API: `https://ai-openbuild.vercel.app/api/nhtsa?vin=2HKRW2H59LH601234&year=2020&make=HONDA&model=CR-V` (HTTP 200 OK)
  - Public GitHub Repo: `https://github.com/Georgefifth/ai-openbuild` (HTTP 200 OK, zero `.env` or secret files tracked)
- [ ] **Human Action Required**: Upload `submission/assets/demo.mp4` to YouTube/Vimeo, fill in `TODO(human)` team name in `About the project`, paste fields from `submission/fields.md` into Devpost, and click **Submit**.
