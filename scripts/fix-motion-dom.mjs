import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

const files = {
  "node_modules/motion-dom/dist/es/animation/generators/utils/is-generator.mjs": `function isGenerator(type) {
    return typeof type === "function";
}

export { isGenerator };
`,
  "node_modules/motion-dom/dist/es/animation/waapi/utils/attach-timeline.mjs": `function attachTimeline(animation, timeline) {
    animation.timeline = timeline;
    animation.onfinish = null;
}

export { attachTimeline };
`,
  "node_modules/motion-dom/dist/es/utils/is-bezier-definition.mjs": `const isBezierDefinition = (easing) => Array.isArray(easing) && typeof easing[0] === "number";

export { isBezierDefinition };
`,
  "node_modules/motion-dom/dist/es/utils/supports/scroll-timeline.mjs": `import { memo } from 'motion-utils';

const supportsScrollTimeline = memo(() => window.ScrollTimeline !== undefined);

export { supportsScrollTimeline };
`,
  "node_modules/motion-dom/dist/es/gestures/drag/state/is-active.mjs": `const isDragging = {
    x: false,
    y: false,
};
function isDragActive() {
    return isDragging.x || isDragging.y;
}

export { isDragActive, isDragging };
`,
  "node_modules/motion-dom/dist/es/gestures/press/utils/state.mjs": `const isPressing = new WeakSet();

export { isPressing };
`,
  "node_modules/motion-dom/dist/es/view/utils/has-target.mjs": `function hasTarget(target, targets) {
    return targets.has(target) && Object.keys(targets.get(target)).length > 0;
}

export { hasTarget };
`,
};

for (const [relativePath, contents] of Object.entries(files)) {
  const filePath = path.join(root, relativePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents);
}

console.log(`Patched motion-dom ESM files: ${Object.keys(files).length}`);
