'use client';

import { useEffect, useRef } from 'react';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  marketCap: number;
}

interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  stock: Stock;
  color: string;
  isDragging?: boolean;
}

interface BubbleCanvasProps {
  stocks: Stock[];
  onStockSelect: (stock: Stock) => void;
  searchTerm?: string;
  displayMode?: 'change' | 'price';
}

export default function BubbleCanvas({ stocks, onStockSelect, searchTerm = '', displayMode = 'change' }: BubbleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const searchTermRef = useRef(searchTerm);
  const displayModeRef = useRef(displayMode);
  const mousePosRef = useRef({ x: -1000, y: -1000 });

  // Keep searchTermRef updated without re-triggering the main animation effect
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  useEffect(() => {
    displayModeRef.current = displayMode;
  }, [displayMode]);

  useEffect(() => {
    if (!canvasRef.current || stocks.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      // Get parent container height
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const absChanges = stocks.map(s => Math.abs(s.change));
    const maxAbs = Math.max(...absChanges);
    const minAbs = Math.min(...absChanges);
    const range = maxAbs - minAbs;

    // Calculate a scale factor based on the smaller dimension of the canvas
    const scaleFactor = Math.min(canvas.width, canvas.height) / 800;

    // Sync persistent bubbles with new stock data to prevent jumping on updates
    const bubbles: Bubble[] = stocks.map((stock, index) => {
      const existing = bubblesRef.current.find(b => b.stock.symbol === stock.symbol);
      const magnitude = Math.abs(stock.change);
      const radius = (range > 0 ? 30 + ((magnitude - minAbs) / range) * 60 : 50) * scaleFactor;

      if (existing) {
        existing.stock = stock;
        existing.radius = radius;
        existing.color = stock.change >= 0 ? '#00ff00' : '#ff0000';
        return existing;
      } else {
        const safeWidth = Math.max(0, canvas.width - 2 * radius);
        const safeHeight = Math.max(0, canvas.height - 2 * radius);
        return {
          x: radius + Math.random() * safeWidth,
          y: radius + Math.random() * safeHeight,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius,
          stock,
          color: stock.change >= 0 ? '#00ff00' : '#ff0000',
          isDragging: false
        };
      }
    });
    bubblesRef.current = bubbles;

    const resolveCollisions = (iterations = 15) => {
      for (let i = 0; i < iterations; i++) {
        for (let j = 0; j < bubbles.length; j++) {
          for (let k = j + 1; k < bubbles.length; k++) {
            const b1 = bubbles[j];
            const b2 = bubbles[k];
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = b1.radius + b2.radius + (2 * scaleFactor); // Proportional padding

            if (distance < minDistance) {
              const overlap = minDistance - (distance || 0.1);
              const nx = dx / (distance || 0.1);
              const ny = dy / (distance || 0.1);

              // Mass-weighted physics (Area is used as proxy for mass)
              const m1 = b1.radius * b1.radius;
              const m2 = b2.radius * b2.radius;

              // Momentum-based bounce effect (restitution)
              // Only apply impulse on the first iteration to prevent velocity explosion
              if (i === 0) {
                const rvx = b2.vx - b1.vx;
                const rvy = b2.vy - b1.vy;
                const velAlongNormal = rvx * nx + rvy * ny;

                // Only resolve if bubbles are moving towards each other
                if (velAlongNormal < 0) {
                  const restitution = 0.6; // Tune for bounciness

                  // If a bubble is being dragged, it acts as if it has infinite mass (invMass = 0)
                  const invM1 = b1.isDragging ? 0 : 1 / m1;
                  const invM2 = b2.isDragging ? 0 : 1 / m2;
                  const jScalar = -(1 + restitution) * velAlongNormal / (invM1 + invM2);

                  const impulseX = jScalar * nx;
                  const impulseY = jScalar * ny;

                  if (!b1.isDragging) {
                    b1.vx -= impulseX * invM1;
                    b1.vy -= impulseY * invM1;
                  }
                  if (!b2.isDragging) {
                    b2.vx += impulseX * invM2;
                    b2.vy += impulseY * invM2;
                  }
                }
              }

              // Positional correction ratio based on mass
              // Larger objects move less during overlap resolution
              const totalMass = m1 + m2;
              const ratio = b1.isDragging ? 1 : (b2.isDragging ? 0 : m2 / totalMass);

              if (!b1.isDragging) {
                b1.x -= nx * overlap * (1 - ratio);
                b1.y -= ny * overlap * (1 - ratio);
              }
              if (!b2.isDragging) {
                b2.x += nx * overlap * ratio;
                b2.y += ny * overlap * ratio;
              }
            }
          }
        }
      }
      // Ensure all bubbles stay within the container after being pushed
      bubbles.forEach(b => {
        b.x = Math.max(b.radius, Math.min(canvas.width - b.radius, b.x));
        b.y = Math.max(b.radius, Math.min(canvas.height - b.radius, b.y));
      });
    };

    resolveCollisions();

    let draggedBubble: Bubble | null = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let hasDragged = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      mousePosRef.current = { x: mouseX, y: mouseY };

      if (draggedBubble) {
        hasDragged = true;
        const nextX = Math.max(draggedBubble.radius, Math.min(canvas.width - draggedBubble.radius, mouseX - dragOffsetX));
        const nextY = Math.max(draggedBubble.radius, Math.min(canvas.height - draggedBubble.radius, mouseY - dragOffsetY));

        // Calculate velocity based on change in position to impart momentum during collisions
        draggedBubble.vx = nextX - draggedBubble.x;
        draggedBubble.vy = nextY - draggedBubble.y;

        draggedBubble.x = nextX;
        draggedBubble.y = nextY;

        // Resolve collisions immediately during drag for better physical feedback
        resolveCollisions();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const clickX = touch.clientX - rect.left;
      const clickY = touch.clientY - rect.top;

      hasDragged = false;
      touchStartX = clickX;
      touchStartY = clickY;

      bubbles.forEach(bubble => {
        const distance = Math.sqrt(
          Math.pow(clickX - bubble.x, 2) + Math.pow(clickY - bubble.y, 2)
        );
        if (distance < bubble.radius) {
          draggedBubble = bubble;
          draggedBubble.isDragging = true;
          dragOffsetX = clickX - bubble.x;
          dragOffsetY = clickY - bubble.y;
          if (e.cancelable) e.preventDefault();
        }
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!draggedBubble) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const mouseX = touch.clientX - rect.left;
      const mouseY = touch.clientY - rect.top;

      mousePosRef.current = { x: mouseX, y: mouseY };

      const dist = Math.sqrt(Math.pow(mouseX - touchStartX, 2) + Math.pow(mouseY - touchStartY, 2));
      if (dist > 7) {
        hasDragged = true;
      }

      const nextX = Math.max(draggedBubble.radius, Math.min(canvas.width - draggedBubble.radius, mouseX - dragOffsetX));
      const nextY = Math.max(draggedBubble.radius, Math.min(canvas.height - draggedBubble.radius, mouseY - dragOffsetY));

      draggedBubble.vx = nextX - draggedBubble.x;
      draggedBubble.vy = nextY - draggedBubble.y;
      draggedBubble.x = nextX;
      draggedBubble.y = nextY;

      resolveCollisions();
      if (e.cancelable) e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!hasDragged && draggedBubble) {
        onStockSelect(draggedBubble.stock);
      }
      handleMouseUp();
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      hasDragged = false;

      bubbles.forEach(bubble => {
        const distance = Math.sqrt(
          Math.pow(clickX - bubble.x, 2) + Math.pow(clickY - bubble.y, 2)
        );
        if (distance < bubble.radius) {
          draggedBubble = bubble;
          draggedBubble.isDragging = true;
          dragOffsetX = clickX - bubble.x;
          dragOffsetY = clickY - bubble.y;
          return;
        }
      });
    };

    const handleMouseLeave = () => {
      mousePosRef.current = { x: -1000, y: -1000 };
      handleMouseUp();
    };

    const handleMouseUp = () => {
      if (draggedBubble) {
        draggedBubble.isDragging = false;
        draggedBubble = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!hasDragged) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left; // Get click X relative to canvas
        const clickY = e.clientY - rect.top; // Get click Y relative to canvas

        // Iterate through bubbles to find if any was clicked
        for (const bubble of bubbles) {
          const distance = Math.sqrt(Math.pow(clickX - bubble.x, 2) + Math.pow(clickY - bubble.y, 2));
          if (distance < bubble.radius) {
            onStockSelect(bubble.stock); // Select the stock if click is within bubble radius
            break; // Exit loop after finding the first clicked bubble
          }
        }
      }
    };

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    // Draw static bubbles (no animation loop)
    const drawBubbles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach(bubble => {
        // Calculate if mouse is hovering over this bubble
        const dx = mousePosRef.current.x - bubble.x;
        const dy = mousePosRef.current.y - bubble.y;
        const isHovered = Math.sqrt(dx * dx + dy * dy) < bubble.radius;

        // Check if this bubble matches the search term
        const isSearchHit = searchTermRef.current &&
          bubble.stock.symbol.toLowerCase() === searchTermRef.current.trim().toLowerCase();

        // Draw hover highlight
        if (isHovered && !isSearchHit) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, bubble.radius + 2, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ffffff';
          ctx.stroke();
          ctx.restore();
        }

        if (isSearchHit) {
          ctx.save();
          const pulse = (Math.sin(Date.now() / 300) + 1) / 2; // Oscillates between 0 and 1
          const extraRadius = 3 + pulse * 5; // Radius expands between 3px and 8px
          const glowBlur = 15 + pulse * 15; // Glow blurs between 15px and 30px

          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, bubble.radius + extraRadius, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2 + pulse * 2; // Border thickens slightly
          ctx.shadowBlur = glowBlur;
          ctx.shadowColor = '#ffffff';
          ctx.stroke();
          ctx.restore();
        }

        ctx.save();

        // Main bubble body
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);

        // Minimalist Radial Gradient focused on the edge
        const gradient = ctx.createRadialGradient(
          bubble.x,
          bubble.y,
          bubble.radius * 0.7, // Inner edge of the gradient
          bubble.x,
          bubble.y,
          bubble.radius
        );

        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Transparent center
        gradient.addColorStop(1, bubble.color);       // Colored edge

        ctx.fillStyle = gradient;
        ctx.fill();

        // Border stroke
        ctx.strokeStyle = bubble.color;
        ctx.lineWidth = Math.max(0.5, 1 * scaleFactor); // Sharp, scaled border
        ctx.stroke();
        ctx.restore();

        // --- Text Drawing Logic ---
        const radius = bubble.radius;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Define padding for text inside the bubble
        const textHorizontalPadding = radius * 0.15; // Slightly reduced padding for larger text
        const innerWidth = radius * 2 - 2 * textHorizontalPadding;
        const textVerticalPadding = radius * 0.15; // Balanced vertical padding
        const innerHeight = radius * 2 - 2 * textVerticalPadding;

        // Helper to get text width for a given font size and style
        const getTextWidth = (text: string, fontSize: number, style: string) => {
          ctx.font = `${style} ${fontSize}px Montserrat`;
          return ctx.measureText(text).width;
        };

        // Helper to get text height for a given font size and style
        const getTextHeight = (text: string, fontSize: number, style: string) => {
          ctx.font = `${style} ${fontSize}px Montserrat`;
          const metrics = ctx.measureText(text);
          return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        };

        const symbolText = bubble.stock.symbol;
        const valueText = displayModeRef.current === 'price'
          ? `$${bubble.stock.price.toFixed(2)}`
          : `${bubble.stock.change >= 0 ? '+' : ''}${bubble.stock.change.toFixed(2)}%`;

        // Initial font size calculations based on radius - reduced by 30%
        let symbolFontSize = radius * 0.56; 
        let valueFontSize = radius * 0.35;   

        // Iteratively reduce font sizes to fit horizontally within innerWidth
        // Prioritize symbol, then value
        let currentSymbolWidth = getTextWidth(symbolText, symbolFontSize, 'normal');
        while (currentSymbolWidth > innerWidth && symbolFontSize > 1) {
          symbolFontSize--;
          currentSymbolWidth = getTextWidth(symbolText, symbolFontSize, 'normal');
        }

        let currentValueWidth = getTextWidth(valueText, valueFontSize, 'normal');
        while (currentValueWidth > innerWidth && valueFontSize > 1) {
          valueFontSize--;
          currentValueWidth = getTextWidth(valueText, valueFontSize, 'normal');
        }

        // Calculate heights with potentially reduced font sizes
        const symbolHeight = getTextHeight(symbolText, symbolFontSize, 'normal');
        const valueHeight = getTextHeight(valueText, valueFontSize, 'normal');

        // Total vertical space needed for text block, including small internal spacing
        const lineSpacing = radius * 0.035; // Small spacing between lines
        let totalTextHeight = symbolHeight + valueHeight + lineSpacing;

        // If total text height exceeds innerHeight, scale down all font sizes proportionally
        if (totalTextHeight > innerHeight && totalTextHeight > 0) { // Avoid division by zero
          const scaleRatio = innerHeight / totalTextHeight;
          symbolFontSize *= scaleRatio;
          valueFontSize *= scaleRatio;

          // Recalculate heights with scaled font sizes for accurate positioning
          totalTextHeight = getTextHeight(symbolText, symbolFontSize, 'normal') +
            getTextHeight(valueText, valueFontSize, 'normal') + lineSpacing;
        }

        // Draw text if the bubble has enough space for two lines
        if (radius > 12) {
          // Calculate starting Y for the top line to center the block
          const startY = bubble.y - totalTextHeight / 2;

          // Symbol (Top)
          ctx.fillStyle = '#ffffff';
          ctx.font = `normal ${symbolFontSize}px Montserrat`;
          ctx.fillText(symbolText, bubble.x, startY + symbolHeight / 2);

          // Value (Bottom)
          ctx.fillStyle = '#ffffff';
          ctx.font = `normal ${valueFontSize}px Montserrat`;
          ctx.fillText(valueText, bubble.x, startY + symbolHeight + lineSpacing + valueHeight / 2);
        } else if (radius > 2) {
          // For smaller bubbles, show only the symbol centered
          // Re-calculate symbol font size for single line display, ensuring it fits horizontally and vertically
          let singleSymbolFontSize = radius * 1.05; // Start big and shrink to fit
          let currentSingleSymbolWidth = getTextWidth(symbolText, singleSymbolFontSize, 'normal');
          while (currentSingleSymbolWidth > innerWidth && singleSymbolFontSize > 1) {
            singleSymbolFontSize--;
            currentSingleSymbolWidth = getTextWidth(symbolText, singleSymbolFontSize, 'normal');
          }
          let singleSymbolHeight = getTextHeight(symbolText, singleSymbolFontSize, 'normal');
          if (singleSymbolHeight > innerHeight && singleSymbolHeight > 0) {
            singleSymbolFontSize *= (innerHeight / singleSymbolHeight);
          }

          ctx.fillStyle = '#ffffff';
          ctx.font = `normal ${singleSymbolFontSize}px Montserrat`;
          ctx.fillText(bubble.stock.symbol, bubble.x, bubble.y);
        }
      });
    };

    let animationId: number;
    const animate = () => {
      bubbles.forEach(b => {
        if (!b.isDragging) {
          // Update position
          b.x += b.vx;
          b.y += b.vy;

          // Friction
          b.vx *= 0.985;
          b.vy *= 0.985;

          // Bounce off walls
          if (b.x - b.radius < 0) { b.x = b.radius; b.vx = Math.abs(b.vx) * 0.7; }
          else if (b.x + b.radius > canvas.width) { b.x = canvas.width - b.radius; b.vx = -Math.abs(b.vx) * 0.7; }

          if (b.y - b.radius < 0) { b.y = b.radius; b.vy = Math.abs(b.vy) * 0.7; }
          else if (b.y + b.radius > canvas.height) { b.y = canvas.height - b.radius; b.vy = -Math.abs(b.vy) * 0.7; }

          // Ambient motion
          b.vx += (Math.random() - 0.5) * 0.05;
          b.vy += (Math.random() - 0.5) * 0.05;
        }
      });

      resolveCollisions();
      drawBubbles();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animationId);
    };
  }, [stocks]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
