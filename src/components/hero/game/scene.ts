import { sriLanka } from "./beats/00-sri-lanka";
import { drawSkyline, flight } from "./beats/01-flight";
import { jump } from "./beats/02-jump";
import { phd } from "./beats/03-phd";
import { seerGrows } from "./beats/04-seer-grows";
import { seerCrumbles } from "./beats/05-seer-crumbles";
import { leonardo } from "./beats/06-leonardo";
import { hand } from "./beats/07-hand";
import { canva } from "./beats/08-canva";
import { fall } from "./beats/09-fall";
import { wave } from "./beats/10-wave";
import type { Beat } from "./beats/common";
import { GLYPH_H, textSprite, textWidth } from "./font";
import { PALETTE } from "./palette";
import { BEAT_MS, beatAt, CARD_MS, CARD_SLIDE_MS, CARDS } from "./timeline";
import { clamp, drawClouds, drawGround, drawHorizon, drawSky, drawSun, easeOut, lerp, type World } from "./world";

/** Draws one frame of the story for any time. Shared by the canvas engine and the server-rendered SVG. */

export const BEATS: Beat[] = [sriLanka, flight, jump, phd, seerGrows, seerCrumbles, leonardo, hand, canva, fall, wave];

/** Screen-space iris (game px); `closed` 0 open … 1 shut. */
export type IrisState = { x: number; y: number; closed: number };

/** Level card height and its gap from the top edge, game px. */
const CARD_PAD_X = 4;
const CARD_PAD_Y = 3;
const CARD_TOP = 4;

function drawCard(g: World, beat: number, p: number, calm: boolean) {
  const card = CARDS.find((c) => c.beat === beat);
  if (!card) return;
  const m = p * BEAT_MS[beat] - card.at * BEAT_MS[beat];
  if (m < 0) return;
  let slide = 1;
  if (!calm) {
    if (m > CARD_MS) return;
    slide = Math.min(easeOut(clamp(m / CARD_SLIDE_MS)), easeOut(clamp((CARD_MS - m) / CARD_SLIDE_MS)));
  }
  const w = textWidth(card.text) + CARD_PAD_X * 2;
  const h = GLYPH_H + CARD_PAD_Y * 2;
  const { left, right, top } = g.view;
  const x = Math.round((left + right) / 2 - w / 2);
  const y = Math.round(lerp(top - h - 2, top + CARD_TOP, slide));
  g.screenRect(PALETTE.k, x, y, w, h);
  g.screenRect(PALETTE.o, x, y + h - 1, w, 1);
  g.screenSpr(textSprite(card.text, "w"), x + CARD_PAD_X, y + CARD_PAD_Y);
}

export function drawScene(g: World): IrisState | null {
  const { i, p } = beatAt(g.t);
  g.beat = i;
  g.p = p;
  g.focus = BEATS[i].focus(p);

  drawSky(g);
  drawSun(g);
  drawClouds(g);
  drawSkyline(g);
  drawHorizon(g);
  drawGround(g);
  for (const b of BEATS) b.scenery?.(g);
  const iris = BEATS[i].actors(g, p);
  drawCard(g, i, p, g.calm);
  if (!iris || iris.closed <= 0) return null;
  return { x: g.sx(iris.x), y: g.sy(iris.y), closed: iris.closed };
}

