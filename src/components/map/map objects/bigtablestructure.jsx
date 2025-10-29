// BigTableStructure.jsx (single image with a collision box)
import React, { useEffect, useRef } from "react";
import bigtable from "../map assets/big table.svg";
import ZoneButton from "../map-components/button.jsx"
const DEFAULT_TABLE_POSITION = Object.freeze({ x: 25, y: 25 });
const BigTableStructure = ({
  id = "bigtable",
  onObstaclesReady,
  position,
  containerRef,
  imageSize,      // optional square size (px)
  imageWidth,     // optional width (px)
  imageHeight,    // optional height (px)
}) => {
  const tableRef = useRef(null);
  const bigTableRef = useRef(null);
  const tablePosition = position ?? DEFAULT_TABLE_POSITION;

  const notifyObstacles = onObstaclesReady;


  useEffect(() => {
    let ro;

    const setup = () => {
      const container = containerRef?.current;
      if (!container) {
      
        requestAnimationFrame(setup);
        return;
      }

      const computeAndSend = () => {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

  
        if (!containerWidth || !containerHeight) {
          notifyObstacles?.(id, []);
          return;
        }

        // Start with no obstacles from legacy rectangles; we only use the image bounds now.
        const obstacles = [];

        // Also add a collision box for the big table SVG, measured from its DOM box
        const tableEl = bigTableRef.current;
        if (tableEl) {
          const containerRect = container.getBoundingClientRect();
          const tableRect = tableEl.getBoundingClientRect();
          if (tableRect.width > 0 && tableRect.height > 0) {
            // Adjust for world scale: convert measured (scaled) px back to unscaled px
            const scaleX = containerRect.width / containerWidth;
            const scaleY = containerRect.height / containerHeight;
            const centerXpx = (tableRect.left - containerRect.left + tableRect.width / 2) / (scaleX || 1);
            const centerYpx = (tableRect.top - containerRect.top + tableRect.height / 2) / (scaleY || 1);
            const widthPx = tableRect.width / (scaleX || 1);
            const heightPx = tableRect.height / (scaleY || 1);
            const xPercent = (centerXpx / containerWidth) * 100;
            const yPercent = (centerYpx / containerHeight) * 100;
            const widthPercent = (widthPx / containerWidth) * 100;
            const heightPercent = (heightPx / containerHeight) * 100;
            obstacles.push({
              id: `${id}-big-table`,
              x: xPercent,
              y: yPercent,
              width: widthPercent-3,
              height: heightPercent-2,
            });
          }
        }

          const valid = obstacles.filter(
            (o) => Number.isFinite(o.x) && Number.isFinite(o.y) && Number.isFinite(o.width) && Number.isFinite(o.height) && o.width > 0 && o.height > 0
          );

          notifyObstacles?.(id, valid);
      };

      computeAndSend();
      ro = new ResizeObserver(() => computeAndSend());
      ro.observe(container);
    };

    setup();
    return () => ro?.disconnect();
  }, [id, containerRef, tablePosition.x, tablePosition.y, imageSize, imageWidth, imageHeight]);

  return (
    <div
      ref={tableRef}
      className="absolute border-2 border-dashed border-[#385D99] rounded-lg"
      style={{
        width: "400px",
        height: "620px",
        top: `${tablePosition.y}%`,
        left: `${tablePosition.x}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Single image representing the structure; its bounds are used as the collision box */}
      <img
        ref={bigTableRef}
        src={bigtable}
        alt=""
        className="absolute pointer-events-none select-none top-1/2 left-1/2"
        style={{
          width: (typeof imageWidth === 'number') ? imageWidth : (typeof imageSize === 'number' ? imageSize : 220),
          height: (typeof imageHeight === 'number') ? imageHeight : (typeof imageSize === 'number' ? imageSize : 120),
          transform: "translate(-50%, -50%)",
        }}
      />
      <ZoneButton 
       label="Conference Hall" 
       numberOfUsers={16} 
       locked={true} 
     />
    </div>
  );
};

export default BigTableStructure;
