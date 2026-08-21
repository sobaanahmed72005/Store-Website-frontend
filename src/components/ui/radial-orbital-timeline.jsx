"use client";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Link as LinkIcon, Zap } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export default function RadialOrbitalTimeline({
  timelineData,
  orbitStyle = "horizontal",
  showLine = false,
  rotationSpeed = 1.0,
}) {
  const [expandedItems, setExpandedItems] = useState({});
  const [viewMode, setViewMode] = useState("orbital");
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState({});
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });
  const [activeNodeId, setActiveNodeId] = useState(null);
  const containerRef = useRef(null);
  const orbitRef = useRef(null);
  const nodeRefs = useRef({});

  const handleContainerClick = (e) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  // 60fps RequestAnimationFrame Rotation Loop with Adjustable Speed & Hover Pause
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    if (autoRotate && viewMode === "orbital") {
      const step = (now) => {
        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;
        // Base speed scale multiplied by rotationSpeed parameter
        const speedFactor = 6.5 * rotationSpeed;
        setRotationAngle((prev) => (prev + delta * speedFactor) % 360);
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }

    return () => {
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, [autoRotate, viewMode, rotationSpeed]);

  const calculateNodePosition = (index, total) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;

    if (orbitStyle === "horizontal") {
      // Dynamically expand horizontal radius based on total number of brands and screen width
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const isTablet = typeof window !== 'undefined' && window.innerWidth < 1024;
      
      const baseRadiusX = isMobile ? 160 : isTablet ? 280 : 390;
      const dynamicExpandRatio = Math.min(1.35, 1 + (total - 6) * 0.05);
      const radiusX = Math.round(baseRadiusX * dynamicExpandRatio);
      const radiusY = isMobile ? 40 : 52;

      const x = radiusX * Math.cos(radian) + centerOffset.x;
      const y = radiusY * Math.sin(radian) + centerOffset.y;

      // 3D Depth Scaling & Layering as nodes orbit in front / behind central IT core
      const scale = 0.72 + 0.38 * ((1 + Math.sin(radian)) / 2);
      const zIndex = Math.round(100 + 80 * Math.sin(radian));
      const opacity = Math.max(0.55, Math.min(1, 0.6 + 0.4 * ((1 + Math.sin(radian)) / 2)));

      return { x, y, angle, zIndex, opacity, scale };
    } else {
      const radius = typeof window !== 'undefined' && window.innerWidth < 640 ? 110 : 135;

      const x = radius * Math.cos(radian) + centerOffset.x;
      const y = radius * Math.sin(radian) + centerOffset.y;

      const zIndex = Math.round(100 + 50 * Math.cos(radian));
      const opacity = Math.max(0.5, Math.min(1, 0.5 + 0.5 * ((1 + Math.sin(radian)) / 2)));
      const scale = 1;

      return { x, y, angle, zIndex, opacity, scale };
    }
  };

  const getRelatedItems = (itemId) => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds || [] : [];
  };

  const isRelatedToActive = (itemId) => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  return (
    <div
      className="w-full h-[240px] sm:h-[260px] flex flex-col items-center justify-center bg-white overflow-visible relative select-none"
      ref={containerRef}
      onClick={handleContainerClick}
      onMouseEnter={() => setAutoRotate(false)}
      onMouseLeave={() => {
        if (!activeNodeId) setAutoRotate(true);
      }}
    >
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center overflow-visible">
        <div
          className="absolute w-full h-full flex items-center justify-center overflow-visible"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* Central Orbital Core */}
          <div className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 animate-pulse flex items-center justify-center z-[100] shadow-lg shadow-cyan-500/20 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
            <div className="absolute w-18 h-18 rounded-full border border-cyan-400/30 animate-ping opacity-60"></div>
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-cyan-900 shadow">
              IT
            </div>
          </div>

          {/* Orbit Track Line (Optional) */}
          {showLine && (
            orbitStyle === "horizontal" ? (
              <svg className="absolute w-full h-full pointer-events-none z-0" viewBox="0 0 700 300">
                <ellipse
                  cx="350"
                  cy="150"
                  rx="250"
                  ry="55"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeDasharray="6 6"
                  strokeWidth="1.5"
                />
              </svg>
            ) : (
              <div className="absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full border border-slate-200 pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"></div>
            )
          )}

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon || Zap;

            // Smart Popover Direction: if node is in top half (y < 0), pop down; if bottom half (y >= 0), pop up!
            const isTopHalf = position.y < 0;

            const nodeStyle = {
              transform: `translate3d(${position.x}px, ${position.y}px, 0px) translate(-50%, -50%) scale(${isExpanded ? 1.25 : position.scale})`,
              zIndex: isExpanded ? 500 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
              willChange: 'transform, opacity',
            };

            return (
              <div
                key={item.id}
                ref={(el) => (nodeRefs.current[item.id] = el)}
                className={`absolute cursor-pointer left-1/2 top-1/2 ${autoRotate ? 'transition-none' : 'transition-transform duration-500 ease-out'}`}
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* In-Place Detail Card (Smart direction positioning so top part NEVER clips!) */}
                {isExpanded && (
                  <div
                    className={`absolute left-1/2 ${
                      isTopHalf ? 'top-full mt-3' : 'bottom-full mb-3'
                    } -translate-x-1/2 z-[600] w-64 sm:w-72 bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 text-left`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-400">{item.date || 'EST Brand'}</span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {item.category || 'Featured'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(item.id);
                        }}
                        className="text-slate-400 hover:text-slate-700 text-xs font-bold w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-[12px] text-slate-600 leading-snug">{item.content}</p>

                    {/* Direct Brand Products Link Button */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        to={`/shop?brand=${encodeURIComponent(item.title)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#0c4a6e] hover:bg-[#0369a1] px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer group"
                      >
                        <span>Shop {item.title} Products</span>
                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </Link>
                    </div>
                  </div>
                )}

                <div
                  className={`absolute rounded-full -inset-1 pointer-events-none ${
                    isPulsing ? "animate-pulse duration-1000" : ""
                  }`}
                  style={{
                    background: `radial-gradient(circle, rgba(6,182,212,0.2) 0%, rgba(6,182,212,0) 70%)`,
                    width: `${(item.energy || 90) * 0.5 + 40}px`,
                    height: `${(item.energy || 90) * 0.5 + 40}px`,
                    left: `-${((item.energy || 90) * 0.5 + 40 - 40) / 2}px`,
                    top: `-${((item.energy || 90) * 0.5 + 40 - 40) / 2}px`,
                  }}
                ></div>

                {/* Node Pill Icon */}
                <div
                  className={`
                  w-11 h-11 rounded-full flex items-center justify-center p-2
                  ${
                    isExpanded
                      ? "bg-cyan-500 text-white shadow-xl shadow-cyan-500/30 scale-125"
                      : isRelated
                      ? "bg-cyan-100 text-cyan-800"
                      : "bg-white text-slate-800"
                  }
                  border-2 
                  ${
                    isExpanded
                      ? "border-cyan-400"
                      : isRelated
                      ? "border-cyan-400 animate-pulse"
                      : "border-slate-200 shadow-md shadow-slate-200/50"
                  }
                  transition-all duration-300 transform hover:scale-110
                `}
                >
                  {item.logoUrl ? (
                    <img src={item.logoUrl} alt={item.title} className="w-full h-full object-contain pointer-events-none" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Title Badge */}
                <div
                  className={`
                  absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-[11px] font-bold tracking-tight px-2 py-0.5 rounded-full
                  ${
                    isExpanded
                      ? "bg-cyan-600 text-white shadow-md"
                      : isRelated
                      ? "bg-cyan-100 text-cyan-900 border border-cyan-300"
                      : "bg-white/90 text-slate-700 border border-slate-200 shadow-xs"
                  }
                  transition-all duration-300 pointer-events-none
                `}
                >
                  {item.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
