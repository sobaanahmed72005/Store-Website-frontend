"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export default function RadialOrbitalTimeline({ timelineData }) {
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

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  // Silky-Smooth 60fps RequestAnimationFrame Rotation Loop
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    if (autoRotate && viewMode === "orbital") {
      const step = (now) => {
        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;
        setRotationAngle((prev) => (prev + delta * 7) % 360);
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }

    return () => {
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, [autoRotate, viewMode]);

  const centerViewOnNode = (nodeId) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index, total) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 135;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.5,
      Math.min(1, 0.5 + 0.5 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId) => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId) => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "completed":
        return "text-cyan-800 bg-cyan-50 border-cyan-300";
      case "in-progress":
        return "text-slate-800 bg-slate-100 border-slate-300";
      default:
        return "text-slate-800 bg-slate-100 border-slate-300";
    }
  };

  return (
    <div
      className="w-full h-[360px] sm:h-[400px] flex flex-col items-center justify-center bg-white overflow-hidden relative select-none"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* Central Orbital Core */}
          <div className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 animate-pulse flex items-center justify-center z-10 shadow-lg shadow-cyan-500/20">
            <div className="absolute w-18 h-18 rounded-full border border-cyan-400/30 animate-ping opacity-60"></div>
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-cyan-900 shadow">
              IT
            </div>
          </div>

          {/* Orbit Ring Line */}
          <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-slate-200 pointer-events-none"></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate3d(${position.x}px, ${position.y}px, 0px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
              willChange: 'transform, opacity',
            };

            return (
              <div
                key={item.id}
                ref={(el) => (nodeRefs.current[item.id] = el)}
                className={`absolute cursor-pointer ${autoRotate ? 'transition-none' : 'transition-transform duration-500 ease-out'}`}
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={`absolute rounded-full -inset-1 pointer-events-none ${
                    isPulsing ? "animate-pulse duration-1000" : ""
                  }`}
                  style={{
                    background: `radial-gradient(circle, rgba(6,182,212,0.2) 0%, rgba(6,182,212,0) 70%)`,
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
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
                    <Icon size={18} />
                  )}
                </div>

                {/* Node Title Label */}
                <div
                  className={`
                  absolute top-13 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-[11px] font-extrabold tracking-wider uppercase
                  transition-all duration-300 pointer-events-none
                  ${isExpanded ? "text-cyan-700 scale-125 font-black" : "text-slate-800"}
                `}
                >
                  {item.title}
                </div>

                {/* Expanded Brand Info Card */}
                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-64 bg-white/98 backdrop-blur-xl border-cyan-200 shadow-2xl shadow-slate-300/60 overflow-visible text-slate-800 z-50">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-cyan-400"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge
                          className={`px-2 text-[10px] ${getStatusStyles(
                            item.status
                          )}`}
                        >
                          OFFICIAL BRAND
                        </Badge>
                        <span className="text-[10px] font-mono font-bold text-cyan-700">
                          {item.date}
                        </span>
                      </div>
                      <CardTitle className="text-sm mt-2 text-slate-900 flex items-center gap-2 font-bold">
                        {item.logoUrl && (
                          <img src={item.logoUrl} alt={item.title} className="w-5 h-5 object-contain" />
                        )}
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-600">
                      <p>{item.content}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="flex items-center text-cyan-700 font-semibold">
                            <Zap size={12} className="mr-1 text-cyan-600" />
                            Satisfaction Rating
                          </span>
                          <span className="font-mono text-cyan-700 font-bold">{item.energy}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-sky-500"
                            style={{ width: `${item.energy}%` }}
                          ></div>
                        </div>
                      </div>

                      {item.relatedIds && item.relatedIds.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="flex items-center mb-2">
                            <Link size={10} className="text-cyan-600 mr-1" />
                            <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                              Ecosystem Partners
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find(
                                (i) => i.id === relatedId
                              );
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center h-6 px-2 py-0 text-[10px] rounded-full border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100 text-cyan-800 font-medium transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight
                                    size={8}
                                    className="ml-1 text-cyan-600"
                                  />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
