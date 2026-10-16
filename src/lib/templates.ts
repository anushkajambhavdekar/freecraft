import {
  Canvas,
  Circle,
  IText,
  Rect,
  Triangle,
} from "fabric";

export type TemplateDefinition = {
  id: string;
  title: string;
  type: string;
  category: string;
  description: string;
  accent: string;
  background: string;
  tags: string[];
};

export const templates: TemplateDefinition[] = [
  {
    id: "campus-tech-poster",
    title: "Campus Tech Night",
    type: "poster",
    category: "Poster",
    description: "Bold event poster with a modern student-tech feel.",
    accent: "#2563eb",
    background: "#07111f",
    tags: ["Event", "Tech", "Student"],
  },
  {
    id: "minimal-social-launch",
    title: "Minimal Launch Post",
    type: "social",
    category: "Social Post",
    description: "Clean announcement layout with strong typography.",
    accent: "#06b6d4",
    background: "#f8fafc",
    tags: ["Launch", "Minimal", "Social"],
  },
  {
    id: "youtube-neon",
    title: "Neon Video Thumbnail",
    type: "thumbnail",
    category: "Thumbnail",
    description: "High-contrast thumbnail built for quick scanning.",
    accent: "#7c3aed",
    background: "#0b0618",
    tags: ["Video", "Creator", "Bold"],
  },
  {
    id: "academic-certificate",
    title: "Academic Certificate",
    type: "certificate",
    category: "Certificate",
    description: "Formal certificate with editable recipient and date.",
    accent: "#d97706",
    background: "#fffdf7",
    tags: ["Academic", "Formal", "Award"],
  },
  {
    id: "club-invitation",
    title: "Club Invitation",
    type: "invitation",
    category: "Invitation",
    description: "Friendly invitation for student clubs and communities.",
    accent: "#10b981",
    background: "#071713",
    tags: ["Club", "Community", "Event"],
  },
  {
    id: "class-project-title",
    title: "Class Project Cover",
    type: "presentation",
    category: "Presentation",
    description: "A clean title slide for university presentations.",
    accent: "#3b82f6",
    background: "#ffffff",
    tags: ["University", "Slides", "Academic"],
  },
];

export function getTemplate(id: string | null) {
  return templates.find((template) => template.id === id);
}

export function createTemplate(canvas: Canvas, id: string) {
  const template = getTemplate(id);
  if (!template) return null;

  canvas.clear();
  canvas.backgroundColor = template.background;

  if (id === "campus-tech-poster") {
    canvas.add(
      new Rect({ left: 42, top: 42, width: 816, height: 516, rx: 28, ry: 28, fill: "#0d1b2f", stroke: "#173a63", strokeWidth: 2 }),
      new Circle({ left: 635, top: 55, radius: 105, fill: template.accent, opacity: 0.16 }),
      new Circle({ left: 720, top: 300, radius: 70, fill: "#06b6d4", opacity: 0.13 }),
      new IText("FREECRAFT CAMPUS", { left: 82, top: 86, fontSize: 18, fontWeight: "700", fill: "#60a5fa", fontFamily: "Arial" }),
      new IText("TECH\nNIGHT", { left: 80, top: 145, fontSize: 78, lineHeight: 0.86, fontWeight: "800", fill: "#f8fafc", fontFamily: "Arial" }),
      new IText("AI • DESIGN • BUILD", { left: 84, top: 315, fontSize: 19, fontWeight: "700", fill: "#22d3ee", fontFamily: "Arial" }),
      new IText("18 OCTOBER  •  6:00 PM\nAUDITORIUM A", { left: 84, top: 365, fontSize: 22, lineHeight: 1.35, fill: "#cbd5e1", fontFamily: "Arial" }),
      new Rect({ left: 82, top: 465, width: 175, height: 44, rx: 22, fill: template.accent }),
      new IText("REGISTER NOW", { left: 111, top: 478, fontSize: 14, fontWeight: "700", fill: "#ffffff", fontFamily: "Arial" }),
    );
  }

  if (id === "minimal-social-launch") {
    canvas.add(
      new Rect({ left: 45, top: 45, width: 810, height: 510, rx: 28, fill: "#ffffff", stroke: "#e2e8f0", strokeWidth: 2 }),
      new Rect({ left: 45, top: 45, width: 12, height: 510, rx: 6, fill: template.accent }),
      new IText("NEW", { left: 92, top: 88, fontSize: 18, fontWeight: "800", fill: template.accent, fontFamily: "Arial" }),
      new IText("Something\nworth sharing.", { left: 90, top: 140, fontSize: 62, lineHeight: 0.92, fontWeight: "800", fill: "#0f172a", fontFamily: "Arial" }),
      new IText("A clean space for your next announcement, idea, or launch.", { left: 94, top: 310, width: 430, fontSize: 20, lineHeight: 1.35, fill: "#64748b", fontFamily: "Arial" }),
      new Rect({ left: 94, top: 405, width: 185, height: 52, rx: 26, fill: template.accent }),
      new IText("LEARN MORE  →", { left: 124, top: 421, fontSize: 14, fontWeight: "700", fill: "#ffffff", fontFamily: "Arial" }),
      new Circle({ left: 650, top: 145, radius: 105, fill: "#cffafe" }),
      new Circle({ left: 700, top: 215, radius: 52, fill: template.accent, opacity: 0.88 }),
    );
  }

  if (id === "youtube-neon") {
    canvas.add(
      new Rect({ left: 38, top: 38, width: 824, height: 524, rx: 24, fill: "#110a25" }),
      new Circle({ left: 570, top: 35, radius: 150, fill: template.accent, opacity: 0.24 }),
      new Triangle({ left: 680, top: 145, width: 120, height: 120, fill: "#22d3ee", angle: 15, opacity: 0.9 }),
      new IText("THE FUTURE\nOF AI", { left: 80, top: 105, fontSize: 68, lineHeight: 0.88, fontWeight: "900", fill: "#ffffff", fontFamily: "Arial" }),
      new IText("WHAT CHANGES NEXT?", { left: 84, top: 275, fontSize: 22, fontWeight: "700", fill: "#c4b5fd", fontFamily: "Arial" }),
      new Rect({ left: 82, top: 340, width: 190, height: 12, rx: 6, fill: template.accent }),
      new IText("WATCH NOW", { left: 84, top: 405, fontSize: 19, fontWeight: "800", fill: "#22d3ee", fontFamily: "Arial" }),
    );
  }

  if (id === "academic-certificate") {
    canvas.add(
      new Rect({ left: 30, top: 30, width: 840, height: 540, fill: "#fffdf7", stroke: "#d97706", strokeWidth: 5 }),
      new Rect({ left: 48, top: 48, width: 804, height: 504, fill: "transparent", stroke: "#f2c078", strokeWidth: 1 }),
      new IText("CERTIFICATE", { left: 292, top: 100, fontSize: 42, fontWeight: "800", fill: "#92400e", fontFamily: "Georgia" }),
      new IText("OF ACHIEVEMENT", { left: 324, top: 150, fontSize: 16, fontWeight: "700", fill: "#b45309", fontFamily: "Arial" }),
      new IText("This certificate is proudly presented to", { left: 275, top: 230, fontSize: 18, fill: "#57534e", fontFamily: "Georgia" }),
      new IText("Your Name", { left: 325, top: 275, fontSize: 44, fontWeight: "700", fill: "#1c1917", fontFamily: "Georgia" }),
      new Rect({ left: 305, top: 335, width: 290, height: 2, fill: "#d97706" }),
      new IText("For outstanding contribution and achievement", { left: 285, top: 365, fontSize: 16, fill: "#78716c", fontFamily: "Arial" }),
      new IText("18 October 2026", { left: 95, top: 475, fontSize: 15, fill: "#57534e", fontFamily: "Arial" }),
      new IText("FREECRAFT UNIVERSITY", { left: 610, top: 475, fontSize: 15, fontWeight: "700", fill: "#92400e", fontFamily: "Arial" }),
    );
  }

  if (id === "club-invitation") {
    canvas.add(
      new Rect({ left: 45, top: 45, width: 810, height: 510, rx: 36, fill: "#0b1f1a" }),
      new Circle({ left: 615, top: 65, radius: 125, fill: "#10b981", opacity: 0.16 }),
      new Circle({ left: 710, top: 345, radius: 80, fill: "#34d399", opacity: 0.12 }),
      new IText("YOU'RE INVITED", { left: 92, top: 90, fontSize: 18, fontWeight: "800", fill: "#6ee7b7", fontFamily: "Arial" }),
      new IText("Creative\nClub Meetup", { left: 88, top: 145, fontSize: 65, lineHeight: 0.9, fontWeight: "800", fill: "#ecfdf5", fontFamily: "Arial" }),
      new IText("Meet • Make • Share", { left: 94, top: 315, fontSize: 22, fontWeight: "700", fill: "#a7f3d0", fontFamily: "Arial" }),
      new IText("Friday · 7 PM\nDesign Lab · Room 204", { left: 94, top: 365, fontSize: 19, lineHeight: 1.4, fill: "#d1fae5", fontFamily: "Arial" }),
      new Rect({ left: 94, top: 470, width: 180, height: 44, rx: 22, fill: "#10b981" }),
      new IText("RSVP", { left: 159, top: 483, fontSize: 15, fontWeight: "800", fill: "#052e24", fontFamily: "Arial" }),
    );
  }

  if (id === "class-project-title") {
    canvas.add(
      new Rect({ left: 0, top: 0, width: 900, height: 600, fill: "#ffffff" }),
      new Rect({ left: 0, top: 0, width: 18, height: 600, fill: template.accent }),
      new IText("UNIVERSITY PROJECT", { left: 75, top: 80, fontSize: 17, fontWeight: "700", fill: template.accent, fontFamily: "Arial" }),
      new IText("Designing\nfor humans.", { left: 74, top: 150, fontSize: 72, lineHeight: 0.88, fontWeight: "800", fill: "#0f172a", fontFamily: "Arial" }),
      new IText("A thoughtful approach to interfaces, accessibility, and everyday digital experiences.", { left: 78, top: 340, width: 520, fontSize: 20, lineHeight: 1.4, fill: "#64748b", fontFamily: "Arial" }),
      new Rect({ left: 650, top: 105, width: 150, height: 360, rx: 30, fill: "#eff6ff" }),
      new Rect({ left: 682, top: 145, width: 86, height: 12, rx: 6, fill: template.accent }),
      new Rect({ left: 682, top: 185, width: 105, height: 8, rx: 4, fill: "#bfdbfe" }),
      new Rect({ left: 682, top: 220, width: 75, height: 75, rx: 18, fill: template.accent, opacity: 0.9 }),
      new Circle({ left: 705, top: 340, radius: 32, fill: "#dbeafe" }),
    );
  }

  canvas.requestRenderAll();
  return template;
}
