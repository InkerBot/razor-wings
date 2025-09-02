import React, {Component, type ReactNode} from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface FloatingWindowProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  children: ReactNode;
  collapsedContent?: ReactNode;
  title?: string;
  initialPosition?: Position;
  initialSize?: Size;
  minSize?: Size;
  maxSize?: Size;
  resizable?: boolean;
  className?: string;
}

interface FloatingWindowState {
  position: Position;
  size: Size;
  isDragging: boolean;
  isResizing: boolean;
  dragStart: Position | null;
  resizeStart: { position: Position; size: Size } | null;
  resizeDirection: string | null;
  hasMoved: boolean;
}

class FloatingWindow extends Component<FloatingWindowProps, FloatingWindowState> {
  private floatingWindowRef = React.createRef<HTMLDivElement>();

  constructor(props: FloatingWindowProps) {
    super(props);

    const dimensions = this.getResponsiveDimensions();
    const defaultPosition = {
      x: 30, // Fixed pixel values - scaling handled by transform
      y: 30
    };

    const defaultSize = {
      width: props.initialSize?.width || dimensions.defaultWidth,
      height: props.initialSize?.height || dimensions.defaultMinHeight
    };

    this.state = {
      position: props.initialPosition || defaultPosition,
      size: defaultSize,
      isDragging: false,
      isResizing: false,
      dragStart: null,
      resizeStart: null,
      resizeDirection: null,
      hasMoved: false
    };
  }

  componentDidMount() {
    // Listen to window resize events and recheck position
    window.addEventListener('resize', this.handleWindowResize);
    // Initial position check
    this.checkAndConstrainPosition();
  }

  componentWillUnmount() {
    this.removeEventListeners();
    window.removeEventListener('resize', this.handleWindowResize);
  }

  componentDidUpdate(prevProps: FloatingWindowProps) {
    // Recheck position when expanded state changes
    if (prevProps.isExpanded !== this.props.isExpanded) {
      setTimeout(() => this.checkAndConstrainPosition(), 0);
    }
  }

  render() {
    const {
      isExpanded,
      children,
      collapsedContent,
      title = "Razor Wings",
      className = "",
      resizable = true
    } = this.props;
    const {position, size} = this.state;
    const dimensions = this.getResponsiveDimensions();

    return (
      <div
        ref={this.floatingWindowRef}
        className={`floating-window ${isExpanded ? 'expanded' : 'collapsed'} ${resizable ? 'resizable' : ''} ${className}`}
        style={{
          left: position.x,
          top: position.y,
          width: isExpanded ? size.width : undefined,
          height: isExpanded ? size.height : undefined,
          transform: `scale(${dimensions.scale})`,
          transformOrigin: 'top left'
        }}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMoveForCursor}
        onTouchStart={this.onTouchStart}
      >
        <div className="window-content" style={{display: isExpanded ? 'flex' : 'none'}}>
          <div className="window-header">
            <h3>{title}</h3>
            <button className="collapse-btn" onClick={this.handleToggleExpanded}>
              _
            </button>
          </div>
          <div className="window-body">
            {children}
          </div>
        </div>

        <button className="floating-button" style={{display: isExpanded ? 'none' : 'flex'}}
                onClick={this.handleToggleExpanded}>
          R
        </button>
      </div>
    );
  }

  // Convert viewport units to pixels
  private vwToPx = (vw: number): number => {
    return (vw / 100) * window.innerWidth;
  };

  private vhToPx = (vh: number): number => {
    return (vh / 100) * window.innerHeight;
  };

  // Get responsive dimensions based on screen size
  private getResponsiveDimensions = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Base scale factor based on a reference resolution (1920x1080)
    const baseWidth = 1920;
    const baseHeight = 1080;
    const scaleX = screenWidth / baseWidth;
    const scaleY = screenHeight / baseHeight;

    // Calculate overall scale with better bounds for different screen sizes
    let scale = Math.min(scaleX, scaleY);

    // Set reasonable bounds for different screen sizes
    if (screenWidth < 768) {
      // Mobile devices: more conservative scaling
      scale = Math.max(0.6, Math.min(scale, 0.9));
    } else if (screenWidth < 1366) {
      // Small laptops/tablets: moderate scaling
      scale = Math.max(0.75, Math.min(scale, 1.0));
    } else if (screenWidth < 1920) {
      // Standard laptops: normal scaling
      scale = Math.max(0.85, Math.min(scale, 1.1));
    } else {
      // Large screens: allow more scaling but cap at 1.3x
      scale = Math.max(1.0, Math.min(scale, 1.3));
    }

    return {
      edgeSize: 8,
      minVisibleWidth: 50,
      minVisibleHeight: 30,
      defaultWidth: 300,
      defaultMinWidth: 200,
      defaultMinHeight: 150,
      scale
    };
  };

  // Constrain size within min/max bounds
  private constrainSize = (size: Size): Size => {
    const {minSize, maxSize} = this.props;
    const dimensions = this.getResponsiveDimensions();

    // Use responsive defaults if not provided
    const defaultMinSize = {
      width: minSize?.width || dimensions.defaultMinWidth,
      height: minSize?.height || dimensions.defaultMinHeight
    };

    const defaultMaxSize = {
      width: maxSize?.width || this.vwToPx(62.5), // ~62.5vw (1200px on 1920px screen)
      height: maxSize?.height || this.vhToPx(74.1) // ~74.1vh (800px on 1080px screen)
    };

    return {
      width: Math.max(defaultMinSize.width, Math.min(defaultMaxSize.width, size.width)),
      height: Math.max(defaultMinSize.height, Math.min(defaultMaxSize.height, size.height))
    };
  };

  // Get resize direction based on mouse position
  private getResizeDirection = (e: React.MouseEvent): string | null => {
    const element = this.floatingWindowRef.current;
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dimensions = this.getResponsiveDimensions();
    const edgeSize = dimensions.edgeSize;

    const isLeft = x <= edgeSize;
    const isRight = x >= rect.width - edgeSize;
    const isTop = y <= edgeSize;
    const isBottom = y >= rect.height - edgeSize;

    // Disable top and left edge resizing, only allow bottom and right
    // Also disable corner resizing that involves top or left edges
    if (isBottom && isRight) return 'se'; // Bottom-right corner only
    if (isBottom && !isLeft && !isRight) return 's'; // Bottom edge only
    if (isRight && !isTop && !isBottom) return 'e'; // Right edge only

    return null;
  };

  // Get resize direction based on touch position
  private getResizeDirectionTouch = (touch: React.Touch): string | null => {
    const element = this.floatingWindowRef.current;
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const dimensions = this.getResponsiveDimensions();
    const edgeSize = dimensions.edgeSize * 2; // Larger touch target for better usability

    const isLeft = x <= edgeSize;
    const isRight = x >= rect.width - edgeSize;
    const isTop = y <= edgeSize;
    const isBottom = y >= rect.height - edgeSize;

    // Same logic as mouse but with larger touch targets
    if (isBottom && isRight) return 'se'; // Bottom-right corner only
    if (isBottom && !isLeft && !isRight) return 's'; // Bottom edge only
    if (isRight && !isTop && !isBottom) return 'e'; // Right edge only

    return null;
  };

  // Handle resize mouse down
  private onResizeMouseDown = (e: React.MouseEvent) => {
    if (!this.props.isExpanded || this.props.resizable === false) return;

    const direction = this.getResizeDirection(e);
    if (!direction) return;

    e.preventDefault();
    e.stopPropagation();

    this.setState({
      isResizing: true,
      resizeDirection: direction,
      resizeStart: {
        position: {x: e.clientX, y: e.clientY},
        size: {...this.state.size}
      },
      hasMoved: false
    });

    document.addEventListener('mousemove', this.onResizeMouseMove);
    document.addEventListener('mouseup', this.onResizeMouseUp);
  };

  // Handle resize touch start
  private onResizeTouchStart = (e: React.TouchEvent) => {
    if (!this.props.isExpanded || this.props.resizable === false) return;
    if (e.touches.length !== 1) return; // Only handle single touch for resizing

    const touch = e.touches[0];
    const direction = this.getResizeDirectionTouch(touch);
    if (!direction) return;

    e.preventDefault();
    e.stopPropagation();

    this.setState({
      isResizing: true,
      resizeDirection: direction,
      resizeStart: {
        position: {x: touch.clientX, y: touch.clientY},
        size: {...this.state.size}
      },
      hasMoved: false
    });

    document.addEventListener('touchmove', this.onResizeTouchMove, {passive: false});
    document.addEventListener('touchend', this.onResizeTouchEnd);
  };

  // Handle resize mouse move
  private onResizeMouseMove = (e: MouseEvent) => {
    if (!this.state.isResizing || !this.state.resizeStart || !this.state.resizeDirection) return;

    const {resizeStart, resizeDirection, position} = this.state;
    const deltaX = e.clientX - resizeStart.position.x;
    const deltaY = e.clientY - resizeStart.position.y;

    const newSize = {...resizeStart.size};
    const newPosition = {...position};

    switch (resizeDirection) {
      case 'n':
        newSize.height = resizeStart.size.height - deltaY;
        newPosition.y = position.y + deltaY;
        break;
      case 's':
        newSize.height = resizeStart.size.height + deltaY;
        break;
      case 'w':
        newSize.width = resizeStart.size.width - deltaX;
        newPosition.x = position.x + deltaX;
        break;
      case 'e':
        newSize.width = resizeStart.size.width + deltaX;
        break;
      case 'nw':
        newSize.width = resizeStart.size.width - deltaX;
        newSize.height = resizeStart.size.height - deltaY;
        newPosition.x = position.x + deltaX;
        newPosition.y = position.y + deltaY;
        break;
      case 'ne':
        newSize.width = resizeStart.size.width + deltaX;
        newSize.height = resizeStart.size.height - deltaY;
        newPosition.y = position.y + deltaY;
        break;
      case 'sw':
        newSize.width = resizeStart.size.width - deltaX;
        newSize.height = resizeStart.size.height + deltaY;
        newPosition.x = position.x + deltaX;
        break;
      case 'se':
        newSize.width = resizeStart.size.width + deltaX;
        newSize.height = resizeStart.size.height + deltaY;
        break;
    }

    const constrainedSize = this.constrainSize(newSize);
    const constrainedPosition = this.constrainPosition(newPosition);

    this.setState({
      size: constrainedSize,
      position: constrainedPosition,
      hasMoved: true
    });
  };

  // Handle resize touch move
  private onResizeTouchMove = (e: TouchEvent) => {
    if (!this.state.isResizing || !this.state.resizeStart || !this.state.resizeDirection) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - this.state.resizeStart.position.x;
    const deltaY = touch.clientY - this.state.resizeStart.position.y;

    const newSize = {...this.state.resizeStart.size};
    const newPosition = {...this.state.position};

    switch (this.state.resizeDirection) {
      case 'n':
        newSize.height = this.state.resizeStart.size.height - deltaY;
        newPosition.y = this.state.position.y + deltaY;
        break;
      case 's':
        newSize.height = this.state.resizeStart.size.height + deltaY;
        break;
      case 'w':
        newSize.width = this.state.resizeStart.size.width - deltaX;
        newPosition.x = this.state.position.x + deltaX;
        break;
      case 'e':
        newSize.width = this.state.resizeStart.size.width + deltaX;
        break;
      case 'nw':
        newSize.width = this.state.resizeStart.size.width - deltaX;
        newSize.height = this.state.resizeStart.size.height - deltaY;
        newPosition.x = this.state.position.x + deltaX;
        newPosition.y = this.state.position.y + deltaY;
        break;
      case 'ne':
        newSize.width = this.state.resizeStart.size.width + deltaX;
        newSize.height = this.state.resizeStart.size.height - deltaY;
        newPosition.y = this.state.position.y + deltaY;
        break;
      case 'sw':
        newSize.width = this.state.resizeStart.size.width - deltaX;
        newSize.height = this.state.resizeStart.size.height + deltaY;
        newPosition.x = this.state.position.x + deltaX;
        break;
      case 'se':
        newSize.width = this.state.resizeStart.size.width + deltaX;
        newSize.height = this.state.resizeStart.size.height + deltaY;
        break;
    }

    const constrainedSize = this.constrainSize(newSize);
    const constrainedPosition = this.constrainPosition(newPosition);

    this.setState({
      size: constrainedSize,
      position: constrainedPosition,
      hasMoved: true
    });
  };

  // Handle resize mouse up
  private onResizeMouseUp = () => {
    this.setState({
      isResizing: false,
      resizeDirection: null,
      resizeStart: null,
      hasMoved: false
    });

    document.removeEventListener('mousemove', this.onResizeMouseMove);
    document.removeEventListener('mouseup', this.onResizeMouseUp);
  };

  // Handle resize touch end
  private onResizeTouchEnd = () => {
    this.setState({
      isResizing: false,
      resizeDirection: null,
      resizeStart: null,
      hasMoved: false
    });

    document.removeEventListener('touchmove', this.onResizeTouchMove);
    document.removeEventListener('touchend', this.onResizeTouchEnd);
  };

  // Get cursor style for resize direction
  private getCursorStyle = (direction: string): string => {
    const cursors: Record<string, string> = {
      'n': 'n-resize',
      's': 's-resize',
      'w': 'w-resize',
      'e': 'e-resize',
      'nw': 'nw-resize',
      'ne': 'ne-resize',
      'sw': 'sw-resize',
      'se': 'se-resize'
    };
    return cursors[direction] || 'default';
  };

  // Handle mouse move for cursor changes
  private onMouseMoveForCursor = (e: React.MouseEvent) => {
    if (!this.props.isExpanded || this.props.resizable === false || this.state.isDragging || this.state.isResizing) return;

    const direction = this.getResizeDirection(e);
    const element = this.floatingWindowRef.current;

    if (element) {
      element.style.cursor = direction ? this.getCursorStyle(direction) : 'default';
    }
  };

  // Handle window resize events
  private handleWindowResize = () => {
    this.checkAndConstrainPosition();
  };

  // Check and constrain current position
  private checkAndConstrainPosition = () => {
    const constrainedPosition = this.constrainPosition(this.state.position);
    if (constrainedPosition.x !== this.state.position.x || constrainedPosition.y !== this.state.position.y) {
      this.setState({position: constrainedPosition});
    }
  };

  // Boundary check function
  private constrainPosition = (position: Position): Position => {
    const element = this.floatingWindowRef.current;
    if (!element) return position;

    const elementWidth = element.offsetWidth;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const dimensions = this.getResponsiveDimensions();

    // Use responsive default value if element dimensions are not calculated yet
    const width = elementWidth || dimensions.defaultWidth;

    // Use responsive minimum visible areas
    const minVisibleWidth = dimensions.minVisibleWidth;
    const minVisibleHeight = dimensions.minVisibleHeight;

    // Calculate boundary constraints
    const minX = -width + minVisibleWidth;
    const maxX = windowWidth - minVisibleWidth;
    const minY = 0; // Top boundary: cannot exceed screen top
    const maxY = windowHeight - minVisibleHeight;

    const constrainedX = Math.max(minX, Math.min(maxX, position.x));
    const constrainedY = Math.max(minY, Math.min(maxY, position.y));

    return {
      x: constrainedX,
      y: constrainedY
    };
  };

  private removeEventListeners = () => {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
    document.removeEventListener('mousemove', this.onResizeMouseMove);
    document.removeEventListener('mouseup', this.onResizeMouseUp);
    document.removeEventListener('touchmove', this.onResizeTouchMove);
    document.removeEventListener('touchend', this.onResizeTouchEnd);
  };

  // Mouse drag events
  private onMouseDown = (e: React.MouseEvent) => {
    // Check if this is a resize operation first
    if (this.props.isExpanded && this.props.resizable !== false) {
      const direction = this.getResizeDirection(e);
      if (direction) {
        this.onResizeMouseDown(e);
        return;
      }
    }

    // Handle window dragging
    if (this.props.isExpanded) {
      const header = (e.target as Element).closest('.window-header');
      const collapseBtn = (e.target as Element).closest('.collapse-btn');
      if (!header || collapseBtn) return;
    }

    this.setState({
      isDragging: true,
      dragStart: {x: e.clientX - this.state.position.x, y: e.clientY - this.state.position.y},
      hasMoved: false
    });

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.state.isDragging || !this.state.dragStart) return;

    const newPosition = {
      x: e.clientX - this.state.dragStart.x,
      y: e.clientY - this.state.dragStart.y
    };

    // Apply boundary check
    const constrainedPosition = this.constrainPosition(newPosition);

    this.setState({
      position: constrainedPosition,
      hasMoved: true
    });
  };

  private onMouseUp = () => {
    const wasDragging = this.state.isDragging;
    this.setState({isDragging: false, dragStart: null});

    // Delay resetting hasMoved to prevent accidental clicks after drag
    if (wasDragging && this.state.hasMoved) {
      setTimeout(() => {
        this.setState({hasMoved: false});
      }, 100);
    } else {
      this.setState({hasMoved: false});
    }

    this.removeEventListeners();
  };

  // Touch drag events
  private onTouchStart = (e: React.TouchEvent) => {
    // Check if this is a resize operation first (for expanded windows)
    if (this.props.isExpanded && this.props.resizable !== false) {
      const touch = e.touches[0];
      const direction = this.getResizeDirectionTouch(touch);
      if (direction) {
        this.onResizeTouchStart(e);
        return;
      }
    }

    // Handle window dragging for expanded windows
    if (this.props.isExpanded) {
      const header = (e.target as Element).closest('.window-header');
      const collapseBtn = (e.target as Element).closest('.collapse-btn');
      if (!header || collapseBtn) return;
    }

    const touch = e.touches[0];
    this.setState({
      isDragging: true,
      dragStart: {x: touch.clientX - this.state.position.x, y: touch.clientY - this.state.position.y},
      hasMoved: false
    });

    document.addEventListener('touchmove', this.onTouchMove, {passive: false});
    document.addEventListener('touchend', this.onTouchEnd);
  };

  private onTouchMove = (e: TouchEvent) => {
    if (!this.state.isDragging || !this.state.dragStart) return;

    const touch = e.touches[0];
    const newPosition = {
      x: touch.clientX - this.state.dragStart.x,
      y: touch.clientY - this.state.dragStart.y
    };

    // Apply boundary check
    const constrainedPosition = this.constrainPosition(newPosition);

    this.setState({
      position: constrainedPosition,
      hasMoved: true
    });
  };

  private onTouchEnd = () => {
    const wasDragging = this.state.isDragging;
    this.setState({isDragging: false, dragStart: null});

    // Delay resetting hasMoved to prevent accidental clicks after drag
    if (wasDragging && this.state.hasMoved) {
      setTimeout(() => {
        this.setState({hasMoved: false});
      }, 150); // Slightly longer delay for touch to account for slower touch events
    } else {
      this.setState({hasMoved: false});
    }

    this.removeEventListeners();
  };

  // Toggle expanded/collapsed state
  private handleToggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (this.state.hasMoved) {
      return;
    }

    this.props.onToggleExpanded();
  };
}

export default FloatingWindow;
