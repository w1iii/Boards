"use client"

import { useEffect, useRef } from "react"

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    function syncSize() {
      const el = canvasRef.current
      if (!el) return
      const w = el.clientWidth || 1280
      const h = el.clientHeight || 720
      if (el.width !== w || el.height !== h) {
        el.width = w
        el.height = h
      }
    }

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(syncSize).observe(canvasEl)
    }
    syncSize()

    const gl = (canvasEl.getContext("webgl") || canvasEl.getContext("experimental-webgl")) as WebGLRenderingContext | null
    if (!gl) return
    glRef.current = gl

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    float wave1 = sin(uv.x * 3.0 + u_time * 0.5) * 0.5 + 0.5;
    float wave2 = sin(uv.y * 4.0 - u_time * 0.3) * 0.5 + 0.5;

    vec3 lavender = vec3(0.9, 0.88, 1.0);
    vec3 mint = vec3(0.92, 1.0, 0.95);
    vec3 pink = vec3(1.0, 0.9, 0.95);
    vec3 warm = vec3(1.0, 0.95, 0.92);

    vec3 finalColor = mix(lavender, pink, wave1);
    finalColor = mix(finalColor, mint, wave2 * 0.5);
    finalColor = mix(finalColor, warm, wave1 * wave2 * 0.3);

    float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    finalColor -= noise * 0.02;

    gl_FragColor = vec4(finalColor, 1.0);
}`

    function createShader(glCtx: WebGLRenderingContext, type: number, src: string) {
      const s = glCtx.createShader(type)
      if (!s) return null
      glCtx.shaderSource(s, src)
      glCtx.compileShader(s)
      return s
    }

    const prog = gl.createProgram()
    if (!prog) return

    const vsh = createShader(gl, gl.VERTEX_SHADER, vs)
    const fsh = createShader(gl, gl.FRAGMENT_SHADER, fs)
    if (!vsh || !fsh) return

    gl.attachShader(prog, vsh)
    gl.attachShader(prog, fsh)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const pos = gl.getAttribLocation(prog, "a_position")
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, "u_time")
    const uRes = gl.getUniformLocation(prog, "u_resolution")

    let mouse = { x: canvasEl.width / 2, y: canvasEl.height / 2 }

    function handleMouse(event: MouseEvent) {
      const el = canvasRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width && rect.height) {
        mouse.x = ((event.clientX - rect.left) / rect.width) * el.width
        mouse.y = (1.0 - (event.clientY - rect.top) / rect.height) * el.height
      }
    }
    window.addEventListener("mousemove", handleMouse)

    let animId: number

    function render(t: number) {
      const el = canvasRef.current
      const ctx = glRef.current
      if (!el || !ctx) return
      if (typeof ResizeObserver === "undefined") {
        const w = el.clientWidth || 1280
        const h = el.clientHeight || 720
        if (el.width !== w || el.height !== h) { el.width = w; el.height = h }
      }
      ctx.viewport(0, 0, el.width, el.height)
      if (uTime) ctx.uniform1f(uTime, t * 0.001)
      if (uRes) ctx.uniform2f(uRes, el.width, el.height)
      ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4)
      animId = requestAnimationFrame(render)
    }

    render(0)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("mousemove", handleMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  )
}
