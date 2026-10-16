"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  BringToFront,
  Circle as CircleIcon,
  Copy,
  Download,
  Group,
  Layers3,
  MousePointer2,
  Redo2,
  SendToBack,
  Square,
  Trash2,
  Triangle as TriangleIcon,
  Ungroup,
  Undo2,
  Upload,
  ZoomIn,
  ZoomOut,
  Type,
  Bold,
  Italic,
  Underline,
  MoveVertical,
} from "lucide-react";
import {
  ActiveSelection,
  Canvas,
  Circle as FabricCircle,
  FabricImage,
  FabricObject,
  Group as FabricGroup,
  IText,
  Rect,
  Triangle as FabricTriangle,
} from "fabric";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createTemplate, getTemplate } from "@/lib/templates";
import { DESIGN_PREFIX, getProject, updateProject } from "@/lib/projects";

type Tool = "select" | "text" | "rect" | "circle" | "triangle";

const typeNames: Record<string, string> = {
  poster: "Poster",
  presentation: "Presentation",
  resume: "Resume",
  social: "Social Post",
  thumbnail: "YouTube Thumbnail",
  ui: "UI Design",
  certificate: "Certificate",
  invitation: "Invitation",
};

const fonts = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
];

const STORAGE_PREFIX = DESIGN_PREFIX;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function objectLabel(object: FabricObject) {
  if (object instanceof IText) {
    const text = object.text?.trim();
    return text ? text.slice(0, 26) : "Text";
  }
  if (object instanceof FabricGroup) return "Group";
  if (object.type === "image") return "Image";
  if (object.type === "rect") return "Rectangle";
  if (object.type === "circle") return "Circle";
  if (object.type === "triangle") return "Triangle";
  return "Object";
}

export default function EditorPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "poster";
  const templateId = searchParams.get("template");
  const designId = searchParams.get("design") ?? `legacy-${type}`;
  const startFromTemplate = searchParams.get("new") === "1" && Boolean(templateId);

  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const restoringRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tool, setTool] = useState<Tool>("select");
  const [selected, setSelected] = useState<FabricObject | null>(null);
  const [objects, setObjects] = useState<FabricObject[]>([]);
  const [zoom, setZoom] = useState(1);
  const [snap, setSnap] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [fill, setFill] = useState("#2563eb");
  const [background, setBackground] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(30);
  const [fontWeight, setFontWeight] = useState<"normal" | "700">("normal");
  const [fontStyle, setFontStyle] = useState<"normal" | "italic">("normal");
  const [underline, setUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("left");
  const [charSpacing, setCharSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.16);
  const [opacity, setOpacity] = useState(100);
  const [canvasWidth, setCanvasWidth] = useState(900);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [projectName, setProjectName] = useState<string | null>(null);

  const template = useMemo(() => getTemplate(templateId), [templateId]);
  const project = useMemo(() => getProject(designId), [designId]);
  const title = useMemo(() => projectName ?? project?.name ?? template?.title ?? `Untitled ${typeNames[type] ?? "Design"}`, [projectName, project, template, type]);
  const storageKey = `${STORAGE_PREFIX}${designId}`;

  const refreshObjects = () => {
    const canvas = canvasRef.current;
    if (canvas) setObjects([...canvas.getObjects()].reverse());
  };

  const saveNow = () => {
    const canvas = canvasRef.current;
    if (!canvas || restoringRef.current) return;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: "0.7.1",
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        background: canvas.backgroundColor,
        canvas: canvas.toJSON(),
      }),
    );
    updateProject(designId, { updatedAt: Date.now() });
    setSavedAt(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  };

  const scheduleSave = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveNow, 350);
  };

  const snapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas || restoringRef.current) return;

    const json = JSON.stringify(canvas.toJSON());
    const next = historyRef.current.slice(0, historyIndexRef.current + 1);

    if (next[next.length - 1] === json) {
      scheduleSave();
      refreshObjects();
      return;
    }

    next.push(json);
    historyRef.current = next.slice(-80);
    historyIndexRef.current = historyRef.current.length - 1;

    scheduleSave();
    refreshObjects();
  };

  const restore = async (json: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    restoringRef.current = true;
    await canvas.loadFromJSON(JSON.parse(json));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    restoringRef.current = false;

    setSelected(null);
    refreshObjects();
    scheduleSave();
  };

  const undo = async () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    await restore(historyRef.current[historyIndexRef.current]);
  };

  const redo = async () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    await restore(historyRef.current[historyIndexRef.current]);
  };

  const getSelection = () => {
    const canvas = canvasRef.current;
    if (!canvas) return [];
    return canvas.getActiveObjects();
  };

  const hasSelection = Boolean(selected);
  const selectionCount = getSelection().length;

  const addStarter = (canvas: Canvas) => {
    canvas.add(
      new IText(typeNames[type] ?? "Your design", {
        left: 80,
        top: 75,
        fontSize: 54,
        fontWeight: "700",
        fill: "#0f172a",
        fontFamily: "Arial",
        padding: 8,
      }),
      new IText("Start creating something great.", {
        left: 84,
        top: 150,
        fontSize: 22,
        fill: "#64748b",
        fontFamily: "Arial",
        padding: 6,
      }),
      new Rect({
        left: 84,
        top: 215,
        width: 260,
        height: 10,
        rx: 5,
        ry: 5,
        fill: "#2563eb",
      }),
    );
  };

  useEffect(() => {
    if (!canvasEl.current) return;

    const canvas = new Canvas(canvasEl.current, {
      width: 900,
      height: 600,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
    });

    canvasRef.current = canvas;

    const boot = async () => {
      const currentProject = getProject(designId);
      if (currentProject) setProjectName(currentProject.name);

      if (startFromTemplate && templateId) {
        const created = createTemplate(canvas, templateId);
        if (created) {
          restoringRef.current = false;
          const target = `/editor?type=${encodeURIComponent(type)}&design=${encodeURIComponent(designId)}`;
          window.history.replaceState(null, "", target);
          setBackground(created.background);
          setSavedAt("template");
          canvas.requestRenderAll();
          historyRef.current = [JSON.stringify(canvas.toJSON())];
          historyIndexRef.current = 0;
          refreshObjects();
          scheduleSave();
          return;
        }
      }

      const raw = localStorage.getItem(storageKey);

      // One-time migration for designs created by v0.5/v0.6 before project IDs existed.
      if (!raw && designId.startsWith("legacy-") && typeof window !== "undefined") {
        const legacyKeys = [`freecraft:design:v0.6:${type}`, `freecraft:design:v0.5:${type}`];
        const legacyRaw = legacyKeys.map((key) => localStorage.getItem(key)).find(Boolean);
        if (legacyRaw) localStorage.setItem(storageKey, legacyRaw);
      }

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const payload = parsed?.canvas ?? parsed;
          const savedWidth = Number(parsed?.width) || 900;
          const savedHeight = Number(parsed?.height) || 600;
          const savedBackground = typeof parsed?.background === "string" ? parsed.background : "#ffffff";
          canvas.setDimensions({ width: savedWidth, height: savedHeight });
          canvas.backgroundColor = savedBackground;
          setCanvasWidth(savedWidth);
          setCanvasHeight(savedHeight);
          setBackground(savedBackground);
          restoringRef.current = true;
          await canvas.loadFromJSON(payload);
          restoringRef.current = false;
          setSavedAt("restored");
        } catch {
          localStorage.removeItem(storageKey);
          addStarter(canvas);
          setSavedAt("ready");
        }
      } else {
        addStarter(canvas);
        setSavedAt("ready");
      }

      canvas.requestRenderAll();
      historyRef.current = [JSON.stringify(canvas.toJSON())];
      historyIndexRef.current = 0;
      refreshObjects();
    };

    const onSelection = () => {
      const active = canvas.getActiveObject();
      setSelected(active ?? null);

      if (active) {
        const nextFill =
          typeof active.fill === "string" && active.fill.startsWith("#")
            ? active.fill
            : "#2563eb";
        setFill(nextFill);
        setOpacity(Math.round((active.opacity ?? 1) * 100));

        if (active instanceof IText) {
          setFontFamily(active.fontFamily ?? "Arial");
          setFontSize(Math.round(active.fontSize ?? 30));
          setFontWeight(active.fontWeight === "700" || Number(active.fontWeight) >= 700 ? "700" : "normal");
          setFontStyle(active.fontStyle === "italic" ? "italic" : "normal");
          setUnderline(Boolean(active.underline));
          setTextAlign(active.textAlign ?? "left");
          setCharSpacing(Math.round(active.charSpacing ?? 0));
          setLineHeight(Number(active.lineHeight ?? 1.16));
        }
      }
    };

    const onChange = () => {
      const active = canvas.getActiveObject();

      if (
        snap &&
        active &&
        active.type !== "activeSelection" &&
        active.type !== "group"
      ) {
        const left = typeof active.left === "number" ? active.left : 0;
        const top = typeof active.top === "number" ? active.top : 0;

        active.set({
          left: Math.round(left / 8) * 8,
          top: Math.round(top / 8) * 8,
        });
        active.setCoords();
      }

      canvas.requestRenderAll();
      snapshot();
    };

    canvas.on("object:added", onChange);
    canvas.on("object:removed", onChange);
    canvas.on("object:modified", onChange);
    canvas.on("selection:created", onSelection);
    canvas.on("selection:updated", onSelection);
    canvas.on("selection:cleared", () => setSelected(null));

    void boot();

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      canvas.dispose();
      canvasRef.current = null;
    };
    // Initialize one canvas per design type.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, storageKey, startFromTemplate, templateId, designId]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const active = canvas.getActiveObject();
      const editing =
        active instanceof IText && active.isEditing;

      const meta = event.ctrlKey || event.metaKey;

      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        void undo();
        return;
      }

      if (meta && event.key.toLowerCase() === "y") {
        event.preventDefault();
        void redo();
        return;
      }

      if (meta && event.key.toLowerCase() === "d") {
        event.preventDefault();
        void duplicateSelected();
        return;
      }

      if (meta && event.key.toLowerCase() === "a" && !editing) {
        event.preventDefault();
        canvas.discardActiveObject();
        const selection = new ActiveSelection(canvas.getObjects(), {
          canvas,
        });
        canvas.setActiveObject(selection);
        canvas.requestRenderAll();
        return;
      }

      if (meta && event.key.toLowerCase() === "g" && !editing) {
        event.preventDefault();
        groupSelected();
        return;
      }

      if (meta && event.shiftKey && event.key.toLowerCase() === "g" && !editing) {
        event.preventDefault();
        ungroupSelected();
        return;
      }

      if (event.key === "Escape") {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        return;
      }

      if (editing || !active) return;

      const step = event.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (event.key === "ArrowLeft") dx = -step;
      if (event.key === "ArrowRight") dx = step;
      if (event.key === "ArrowUp") dy = -step;
      if (event.key === "ArrowDown") dy = step;

      if (dx || dy) {
        event.preventDefault();
        active.set({
          left: (active.left ?? 0) + dx,
          top: (active.top ?? 0) + dy,
        });
        active.setCoords();
        canvas.requestRenderAll();
        snapshot();
      }

      if ((event.key === "Delete" || event.key === "Backspace") && !editing) {
        event.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const mutateSelection = (mutator: (object: FabricObject) => void) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const selection = canvas.getActiveObjects();
    if (!selection.length) return;

    selection.forEach(mutator);
    selection.forEach((object) => object.setCoords());
    canvas.requestRenderAll();
    snapshot();
  };

  const addText = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const text = new IText("Double-click to edit", {
      left: 180,
      top: 280,
      fontSize,
      fill,
      fontFamily,
      padding: 8,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    canvas.requestRenderAll();
    snapshot();
  };

  const addShape = (shape: Tool) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let object: FabricObject;

    if (shape === "rect") {
      object = new Rect({
        left: 200,
        top: 270,
        width: 150,
        height: 100,
        rx: 12,
        ry: 12,
        fill,
      });
    } else if (shape === "circle") {
      object = new FabricCircle({
        left: 220,
        top: 280,
        radius: 65,
        fill,
      });
    } else {
      object = new FabricTriangle({
        left: 240,
        top: 270,
        width: 140,
        height: 120,
        fill,
      });
    }

    canvas.add(object);
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
    snapshot();
  };

  const uploadImage = (file: File) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reader = new FileReader();

    reader.onload = async () => {
      if (typeof reader.result !== "string") return;

      const image = await FabricImage.fromURL(reader.result);
      const maxSize = 360;
      const scale = Math.min(
        1,
        maxSize / Math.max(image.width ?? 1, image.height ?? 1),
      );

      image.set({
        left: 180,
        top: 230,
        scaleX: scale,
        scaleY: scale,
      });

      canvas.add(image);
      canvas.setActiveObject(image);
      canvas.requestRenderAll();
      snapshot();
    };

    reader.readAsDataURL(file);
  };

  const deleteSelected = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const selection = canvas.getActiveObjects();
    if (!selection.length) return;

    canvas.remove(...selection);
    canvas.discardActiveObject();
    setSelected(null);
    canvas.requestRenderAll();
    snapshot();
  };

  const duplicateSelected = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const selection = canvas.getActiveObjects();
    if (!selection.length) return;

    const copies: FabricObject[] = [];

    for (const object of selection) {
      const copy = await object.clone();
      copy.set({
        left: (object.left ?? 0) + 24,
        top: (object.top ?? 0) + 24,
      });
      copies.push(copy);
    }

    canvas.add(...copies);

    if (copies.length === 1) {
      canvas.setActiveObject(copies[0]);
    } else {
      const activeSelection = new ActiveSelection(copies, { canvas });
      canvas.setActiveObject(activeSelection);
    }

    canvas.requestRenderAll();
    snapshot();
  };

  const groupSelected = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();

    if (!(active instanceof ActiveSelection)) return;

    // Fabric.js 6 no longer exposes ActiveSelection.toGroup().
    // Rebuild the group explicitly from the selected canvas objects.
    const members = active.getObjects().slice();

    canvas.discardActiveObject();
    canvas.remove(...members);

    const group = new FabricGroup(members, {
      originX: "left",
      originY: "top",
    });

    canvas.add(group);
    canvas.setActiveObject(group);
    group.setCoords();
    canvas.requestRenderAll();
    snapshot();
  };

  const ungroupSelected = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();

    if (!(active instanceof FabricGroup)) return;

    // Fabric.js 6 does not provide ActiveSelection.toGroup()/toActiveSelection()
    // as used by older examples. Remove the group and put its children back.
    const members = active.getObjects().slice();

    canvas.remove(active);
    canvas.add(...members);

    const selection = new ActiveSelection(members, { canvas });
    canvas.setActiveObject(selection);
    selection.setCoords();
    canvas.requestRenderAll();
    snapshot();
  };

  const alignHorizontal = (mode: "left" | "center" | "right") => {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();

    if (!canvas || !active) return;

    const width = active.getScaledWidth();

    const left =
      mode === "left"
        ? 24
        : mode === "center"
          ? (canvas.getWidth() - width) / 2
          : canvas.getWidth() - width - 24;

    active.set({ left });
    active.setCoords();
    canvas.requestRenderAll();
    snapshot();
  };

  const centerVertical = () => {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;
    active.set({ top: (canvas.getHeight() - active.getScaledHeight()) / 2 });
    active.setCoords();
    canvas.requestRenderAll();
    snapshot();
  };

  const resizeCanvas = (width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const nextWidth = clamp(Math.round(width), 240, 2400);
    const nextHeight = clamp(Math.round(height), 180, 2400);
    canvas.setDimensions({ width: nextWidth, height: nextHeight });
    setCanvasWidth(nextWidth);
    setCanvasHeight(nextHeight);
    canvas.requestRenderAll();
    snapshot();
  };

  const updateTextStyle = (patch: Record<string, unknown>) => {
    const active = canvasRef.current?.getActiveObject();
    if (!(active instanceof IText)) return;
    active.set(patch as Partial<IText>);
    active.setCoords();
    canvasRef.current?.requestRenderAll();
    snapshot();
  };

  const layerMove = (direction: "front" | "back") => {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();

    if (!canvas || !active) return;

    if (direction === "front") {
      canvas.bringObjectToFront(active);
    } else {
      canvas.sendObjectToBack(active);
    }

    canvas.requestRenderAll();
    snapshot();
  };

  const zoomBy = (amount: number) => {
    const next = clamp(zoom + amount, 0.5, 2);
    setZoom(next);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setZoom(next);
      canvas.requestRenderAll();
    }
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const data = canvas.toDataURL({
      format: "png",
      multiplier: 2,
    });

    const link = document.createElement("a");
    link.href = data;
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.click();
  };

  const setCanvasBackground = (value: string) => {
    setBackground(value);

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.backgroundColor = value;
    canvas.requestRenderAll();
    snapshot();
  };

  const layerObjects = objects;

  const toolbar: [Tool, typeof Type, string][] = [
    ["select", MousePointer2, "Select"],
    ["text", Type, "Text"],
    ["rect", Square, "Rectangle"],
    ["circle", CircleIcon, "Circle"],
    ["triangle", TriangleIcon, "Triangle"],
  ];

  const isMulti = selectionCount > 1;
  const isGroup = selected instanceof FabricGroup;

  return (
    <div className="flex h-screen min-h-[680px] flex-col overflow-hidden bg-[#080b14] text-slate-100">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#0f1422] px-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg p-2 hover:bg-white/10"
            title="Back to FreeCraft"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{title}</div>
            <div className="text-[11px] text-slate-500">
              {savedAt ? `Saved ${savedAt}` : "Saving..."}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link href="/dashboard" className="mr-1 hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 sm:block">
            Projects
          </Link>
          <button
            onClick={() => void undo()}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10"
            title="Undo (Ctrl/Cmd+Z)"
          >
            <Undo2 size={17} />
          </button>
          <button
            onClick={() => void redo()}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10"
            title="Redo (Ctrl/Cmd+Y)"
          >
            <Redo2 size={17} />
          </button>
          <button
            onClick={saveNow}
            className="ml-2 hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 sm:block"
          >
            Save
          </button>
          <Link
            href="/templates"
            className="ml-2 hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 md:block"
          >
            Templates
          </Link>
          <button
            onClick={exportPng}
            className="ml-1 flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold hover:bg-blue-500"
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-[72px] shrink-0 border-r border-white/10 bg-[#0f1422] py-3">
          <div className="flex flex-col items-center gap-1.5">
            {toolbar.map(([id, Icon, label]) => (
              <button
                key={id}
                onClick={() => {
                  setTool(id);

                  if (id === "text") addText();
                  else if (
                    id === "rect" ||
                    id === "circle" ||
                    id === "triangle"
                  ) {
                    addShape(id);
                  }
                }}
                className={`flex w-14 flex-col items-center gap-1 rounded-xl py-2 text-[10px] transition ${
                  tool === id
                    ? "bg-blue-500/15 text-blue-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
                title={label}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}

            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-14 flex-col items-center gap-1 rounded-xl py-2 text-[10px] text-slate-400 hover:bg-white/5 hover:text-white"
              title="Upload image"
            >
              <Upload size={18} />
              Image
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadImage(file);
                event.currentTarget.value = "";
              }}
            />

            <div className="my-1 h-px w-9 bg-white/10" />

            <button
              onClick={() => setSnap((value) => !value)}
              className={`flex w-14 flex-col items-center gap-1 rounded-xl py-2 text-[10px] ${
                snap ? "text-emerald-300" : "text-slate-500"
              }`}
              title="Snap to 8px grid"
            >
              <span className="text-base leading-none">⌘</span>
              Snap
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-auto bg-[#080b14]">
          <div className="flex min-h-full min-w-[980px] items-center justify-center p-10">
            <div
              className="relative rounded-sm shadow-[0_30px_100px_rgba(0,0,0,.45)]"
              style={{
                width: 900 * zoom,
                height: 600 * zoom,
              }}
            >
              <canvas ref={canvasEl} className="block" />
            </div>
          </div>
        </main>

        <aside className="flex w-[340px] shrink-0 flex-col border-l border-white/10 bg-[#0f1422]">
          <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Design
            </span>
            <span className="text-[11px] text-slate-600">
              {objects.length} layers
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-4 p-4">
              {hasSelection ? (
                <>
                  <section className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-slate-500">
                          Selection
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {isMulti
                            ? `${selectionCount} objects`
                            : objectLabel(selected!)}
                        </p>
                      </div>
                      <Layers3 size={16} className="text-slate-500" />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => void duplicateSelected()}
                        className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                      >
                        <Copy size={14} />
                        Duplicate
                      </button>
                      <button
                        onClick={deleteSelected}
                        className="flex items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </section>

                  <section className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="mb-3 text-xs font-semibold text-slate-400">
                      Arrange
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => alignHorizontal("left")}
                        className="rounded-lg border border-white/10 p-2 hover:bg-white/10"
                        title="Align left"
                      >
                        <AlignLeft size={15} />
                      </button>
                      <button
                        onClick={() => alignHorizontal("center")}
                        className="rounded-lg border border-white/10 p-2 hover:bg-white/10"
                        title="Center horizontally"
                      >
                        <AlignCenter size={15} />
                      </button>
                      <button
                        onClick={() => alignHorizontal("right")}
                        className="rounded-lg border border-white/10 p-2 hover:bg-white/10"
                        title="Align right"
                      >
                        <AlignRight size={15} />
                      </button>
                      <button
                        onClick={centerVertical}
                        className="rounded-lg border border-white/10 p-2 hover:bg-white/10"
                        title="Center vertically"
                      >
                        <MoveVertical size={15} />
                      </button>
                      <button
                        onClick={() => layerMove("front")}
                        className="ml-auto rounded-lg border border-white/10 p-2 hover:bg-white/10"
                        title="Bring to front"
                      >
                        <BringToFront size={15} />
                      </button>
                      <button
                        onClick={() => layerMove("back")}
                        className="rounded-lg border border-white/10 p-2 hover:bg-white/10"
                        title="Send to back"
                      >
                        <SendToBack size={15} />
                      </button>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={groupSelected}
                        disabled={!isMulti}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Group size={14} />
                        Group
                      </button>
                      <button
                        onClick={ungroupSelected}
                        disabled={!isGroup}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Ungroup size={14} />
                        Ungroup
                      </button>
                    </div>
                  </section>

                  {!isMulti && !isGroup && (
                    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="mb-3 text-xs font-semibold text-slate-400">
                        Appearance
                      </p>

                      <label className="flex items-center justify-between gap-3 text-xs text-slate-400">
                        Fill
                        <input
                          type="color"
                          value={fill}
                          onChange={(event) => {
                            const value = event.target.value;
                            setFill(value);
                            mutateSelection((object) =>
                              object.set({ fill: value }),
                            );
                          }}
                          className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent"
                        />
                      </label>

                      <label className="mt-4 block text-xs text-slate-400">
                        Opacity
                        <span className="float-right text-slate-500">
                          {opacity}%
                        </span>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={opacity}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            setOpacity(value);
                            mutateSelection((object) =>
                              object.set({ opacity: value / 100 }),
                            );
                          }}
                          className="mt-2 w-full accent-blue-500"
                        />
                      </label>
                    </section>
                  )}

                  {!isMulti && selected instanceof IText && (
                    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-400">Typography</p>
                        <span className="text-[10px] text-slate-600">Text selected</span>
                      </div>

                      <select
                        value={fontFamily}
                        onChange={(event) => {
                          const value = event.target.value;
                          setFontFamily(value);
                          updateTextStyle({ fontFamily: value });
                        }}
                        className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-xs outline-none"
                      >
                        {fonts.map((font) => <option key={font} value={font}>{font}</option>)}
                      </select>

                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        <button onClick={() => { const next = fontWeight === "700" ? "normal" : "700"; setFontWeight(next); updateTextStyle({ fontWeight: next }); }} className={`flex items-center justify-center rounded-lg border p-2 ${fontWeight === "700" ? "border-blue-400/40 bg-blue-500/15 text-blue-200" : "border-white/10 text-slate-400 hover:bg-white/5"}`} title="Bold"><Bold size={15} /></button>
                        <button onClick={() => { const next = fontStyle === "italic" ? "normal" : "italic"; setFontStyle(next); updateTextStyle({ fontStyle: next }); }} className={`flex items-center justify-center rounded-lg border p-2 ${fontStyle === "italic" ? "border-blue-400/40 bg-blue-500/15 text-blue-200" : "border-white/10 text-slate-400 hover:bg-white/5"}`} title="Italic"><Italic size={15} /></button>
                        <button onClick={() => { const next = !underline; setUnderline(next); updateTextStyle({ underline: next }); }} className={`flex items-center justify-center rounded-lg border p-2 ${underline ? "border-blue-400/40 bg-blue-500/15 text-blue-200" : "border-white/10 text-slate-400 hover:bg-white/5"}`} title="Underline"><Underline size={15} /></button>
                      </div>

                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([align, Icon]) => (
                          <button key={align} onClick={() => { setTextAlign(align); updateTextStyle({ textAlign: align }); }} className={`flex items-center justify-center rounded-lg border p-2 ${textAlign === align ? "border-blue-400/40 bg-blue-500/15 text-blue-200" : "border-white/10 text-slate-400 hover:bg-white/5"}`} title={`Align ${align}`}><Icon size={15} /></button>
                        ))}
                      </div>

                      <label className="mt-3 block text-xs text-slate-400">Size
                        <input type="number" min="8" max="160" value={fontSize} onChange={(event) => { const value = clamp(Number(event.target.value) || 8, 8, 160); setFontSize(value); updateTextStyle({ fontSize: value }); }} className="mt-1 w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-xs outline-none" />
                      </label>

                      <label className="mt-3 block text-xs text-slate-400">Letter spacing <span className="float-right text-slate-500">{charSpacing}</span>
                        <input type="range" min="-100" max="300" value={charSpacing} onChange={(event) => { const value = Number(event.target.value); setCharSpacing(value); updateTextStyle({ charSpacing: value }); }} className="mt-2 w-full accent-blue-500" />
                      </label>

                      <label className="mt-3 block text-xs text-slate-400">Line height <span className="float-right text-slate-500">{lineHeight.toFixed(2)}</span>
                        <input type="range" min="0.8" max="2.2" step="0.05" value={lineHeight} onChange={(event) => { const value = Number(event.target.value); setLineHeight(value); updateTextStyle({ lineHeight: value }); }} className="mt-2 w-full accent-blue-500" />
                      </label>
                    </section>
                  )}
                </>
              ) : (
                <section className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs leading-5 text-slate-500">
                  Select one or more objects to edit them.
                  <div className="mt-3 text-[11px] text-slate-600">
                    Shift-click for multi-select · Ctrl/Cmd+A selects all
                  </div>
                </section>
              )}

              <section className="border-t border-white/10 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Canvas size</span>
                  <span className="text-[11px] text-slate-600">{canvasWidth} × {canvasHeight}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    ["Landscape", 1200, 675],
                    ["Square", 1080, 1080],
                    ["HD", 1920, 1080],
                    ["A4", 794, 1123],
                  ].map(([label, width, height]) => (
                    <button key={String(label)} onClick={() => resizeCanvas(Number(width), Number(height))} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-slate-400 hover:bg-white/10 hover:text-white">
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input aria-label="Canvas width" type="number" min="240" max="2400" value={canvasWidth} onChange={(e) => setCanvasWidth(Number(e.target.value) || 240)} onBlur={() => resizeCanvas(canvasWidth, canvasHeight)} className="rounded-lg border border-white/10 bg-[#111827] px-2.5 py-2 text-xs outline-none" />
                  <input aria-label="Canvas height" type="number" min="180" max="2400" value={canvasHeight} onChange={(e) => setCanvasHeight(Number(e.target.value) || 180)} onBlur={() => resizeCanvas(canvasWidth, canvasHeight)} className="rounded-lg border border-white/10 bg-[#111827] px-2.5 py-2 text-xs outline-none" />
                </div>
              </section>

              <section className="border-t border-white/10 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Canvas background
                  </span>
                  <input
                    type="color"
                    value={background}
                    onChange={(event) =>
                      setCanvasBackground(event.target.value)
                    }
                    className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent"
                  />
                </div>
              </section>

              <section className="border-t border-white/10 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Zoom
                  </span>
                  <span className="text-xs text-slate-500">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => zoomBy(-0.1)}
                    className="rounded-lg border border-white/10 p-2 hover:bg-white/5"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <div className="h-1 flex-1 rounded-full bg-white/10">
                    <div
                      className="h-1 rounded-full bg-blue-500"
                      style={{
                        width: `${((zoom - 0.5) / 1.5) * 100}%`,
                      }}
                    />
                  </div>
                  <button
                    onClick={() => zoomBy(0.1)}
                    className="rounded-lg border border-white/10 p-2 hover:bg-white/5"
                  >
                    <ZoomIn size={15} />
                  </button>
                </div>
              </section>

              <section className="border-t border-white/10 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Layers
                  </span>
                  <span className="text-[11px] text-slate-600">
                    {objects.length}
                  </span>
                </div>

                <div className="space-y-1">
                  {layerObjects.map((object, index) => (
                    <button
                      key={`${object.type}-${index}-${object.left}-${object.top}`}
                      onClick={() => {
                        const canvas = canvasRef.current;
                        if (!canvas) return;
                        canvas.setActiveObject(object);
                        canvas.requestRenderAll();
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs ${
                        selected === object
                          ? "bg-blue-500/15 text-blue-200"
                          : "text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      <span className="w-5 text-center text-slate-600">
                        {index + 1}
                      </span>
                      <span className="truncate">{objectLabel(object)}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="border-t border-white/10 pt-4 text-[11px] leading-5 text-slate-600">
                <p>
                  <strong className="font-medium text-slate-500">
                    Shortcuts:
                  </strong>{" "}
                  Ctrl/Cmd+Z undo · Ctrl/Cmd+Y redo · Ctrl/Cmd+D duplicate ·
                  Ctrl/Cmd+G group · Ctrl/Cmd+Shift+G ungroup · Arrow keys move
                </p>
              </section>
            </div>
          </div>
        </aside>
      </div>

      <footer className="flex h-8 shrink-0 items-center justify-center border-t border-white/10 bg-[#0f1422] text-[10px] text-slate-600">
        FreeCraft editor · v0.5 · template-ready design canvas
      </footer>
    </div>
  );
}
