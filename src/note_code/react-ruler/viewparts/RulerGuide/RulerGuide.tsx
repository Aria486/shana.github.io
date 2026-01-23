import React, { forwardRef, useRef } from "react";
import type { MouseEvent } from "react";
import type { RulerGuideProps } from "../types";
import classNames from "classnames";
import "./style.scss";

export const RulerGuide = forwardRef<HTMLDivElement, RulerGuideProps>((props, ref) => {
  const prefixCls = "ruler-guide";
  const {
    direction,
    top = 0,
    left = 0,
    height,
    width,
    id,
    guideType = "dashed",
    cursor,
    move,
    value,
    deleteGuide,
    onGetValue,
    onGuideDragStart,
    onGuideDragEnd,
    ...restProps
  } = props;

  const guideRef = useRef<HTMLDivElement | null>(null);
  const boundaryRef = useRef<HTMLDivElement | null>(null);
  const startPosition = useRef({ x: 0, y: 0 });

  const getBoundary = (moveDistance: number) => {
    const { clientHeight = 0, clientWidth = 0 } = guideRef.current?.parentElement ?? {};
    const parentLength = direction === "horizontal" ? clientHeight : clientWidth;
    if (moveDistance < 0) {
      return 0;
    }
    if (moveDistance > parentLength) {
      return parentLength;
    }
    return moveDistance;
  };

  const handleMousedown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const { clientX: startX, clientY: startY } = e;
    startPosition.current = { x: startX, y: startY };
    onGuideDragStart?.();

    document.onmousemove = (event) => {
      event.preventDefault();
      const { clientX, clientY } = event;
      const { x: startX, y: startY } = startPosition.current;
      const moveDistance = direction === "horizontal" ? clientY - startY : clientX - startX;
      startPosition.current = { x: clientX, y: clientY };
      if (guideRef.current) {
        const positionDistance =
          direction === "horizontal"
            ? parseInt(guideRef.current.style.top) + moveDistance
            : parseInt(guideRef.current.style.left) + moveDistance;
        if (direction === "horizontal") {
          guideRef.current.style.top = `${positionDistance}px`;
        } else {
          guideRef.current.style.left = `${positionDistance}px`;
        }
        if (onGetValue && boundaryRef.current) {
          boundaryRef.current.textContent = `${onGetValue?.(positionDistance)}`;
        }
      }

      document.onmouseup = () => {
        // 鼠标抬起时，如果辅助线在边界外，则将其移动到边界，否则会看不到
        if (guideRef.current) {
          const positionDistance =
            direction === "horizontal"
              ? parseInt(guideRef.current.style.top) + moveDistance
              : parseInt(guideRef.current.style.left) + moveDistance;
          const boundary = getBoundary(positionDistance);
          if (direction === "horizontal") {
            guideRef.current.style.top = `${boundary}px`;
          } else {
            guideRef.current.style.left = `${boundary}px`;
          }
          const boundaryKey = direction === "horizontal" ? "top" : "left";
          if (onGuideDragEnd && direction) {
            onGuideDragEnd({ ...props, [boundaryKey]: boundary });
          }
        }

        document.onmousemove = null;
        document.onmouseup = null;
      };
      return false;
    };
  };

  return (
    <div
      {...restProps}
      className={classNames(prefixCls, direction && `${prefixCls}-${direction}`)}
      id={id}
      ref={(element) => {
        guideRef.current = element;
        if (typeof ref === "function") {
          ref(element);
        } else {
          if (ref) {
            ref.current = element;
          }
        }
      }}
      style={{ position: "absolute", top, left, height, width, "--guide-type": guideType, cursor: cursor } as React.CSSProperties}
      onMouseDown={move ? handleMousedown : undefined}
      onClick={(e) => move && e.stopPropagation()}
    >
      <div className={classNames(`${prefixCls}-aux`, direction && `${prefixCls}-aux-${direction}`)}>
        {deleteGuide && (
          <div className={classNames(`${prefixCls}-aux-close`)} onClick={() => deleteGuide(id!)}>
            x
          </div>
        )}
        {value && (
          <div className={classNames(`${prefixCls}-aux-value`)} ref={boundaryRef}>
            {value}
          </div>
        )}
      </div>
    </div>
  );
});

RulerGuide.displayName = "RulerGuide";
