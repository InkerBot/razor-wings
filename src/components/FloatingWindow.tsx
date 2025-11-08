import React, { Component, type ReactNode } from 'react';
import type {Position, Size} from "../types";

export interface HeaderConfig {
  /** Header title */
  title: string;
  /** Custom header content (overrides title if provided) */
  customContent?: ReactNode;
  /** Show collapse/expand button */
  showToggleButton?: boolean;
  /** Custom toggle button content */
  toggleButtonContent?: ReactNode;
  /** Additional header actions */
  actions?: ReactNode;
}

export interface CollapsedConfig {
  /** Content to show when collapsed */
  content?: ReactNode;
  /** Custom className for collapsed state */
  className?: string;
}

export interface FloatingWindowCallbacks {
  /** Called when window is moved */
  onMove?: (position: Position) => void;
  /** Called when window is resized */
  onResize?: (size: Size) => void;
  /** Called when expanded state changes */
  onToggleExpanded?: () => void;
}

export interface FloatingWindowProps extends FloatingWindowCallbacks {
  /** Whether window is expanded */
  isExpanded: boolean;
  /** Main content of the window */
  children: ReactNode;
  /** Header configuration */
  header?: HeaderConfig | string; // string for simple title
  /** Collapsed state configuration */
  collapsed?: CollapsedConfig | ReactNode; // ReactNode for simple content
  /** Footer content (optional) */
  footer?: ReactNode;
  /** Initial position */
  initialPosition?: Position;
  /** Initial size */
  initialSize?: Size;
  /** Minimum size */
  minSize?: Size;
  /** Maximum size */
  maxSize?: Size;
  /** Enable resizing */
  resizable?: boolean;
  /** Enable dragging */
  draggable?: boolean;
  /** Custom className */
  className?: string;
  /** Show header in expanded mode */
  showHeader?: boolean;
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

  static defaultProps: Partial<FloatingWindowProps> = {
    resizable: true,
    draggable: true,
    showHeader: true,
    header: 'Window'
  };

  constructor(props: FloatingWindowProps) {
    super(props);

    const dimensions = this.getResponsiveDimensions();
    const defaultPosition = { x: 30, y: 30 };
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
    window.addEventListener('resize', this.handleWindowResize);
    this.checkAndConstrainPosition();
  }

  componentWillUnmount() {
    this.removeEventListeners();
    window.removeEventListener('resize', this.handleWindowResize);
  }

  componentDidUpdate(prevProps: FloatingWindowProps, prevState: FloatingWindowState) {
    // Recheck position when expanded state changes
    if (prevProps.isExpanded !== this.props.isExpanded) {
      setTimeout(() => this.checkAndConstrainPosition(), 0);
    }

    // Notify callbacks
    if (prevState.position !== this.state.position && this.props.onMove) {
      this.props.onMove(this.state.position);
    }
    if (prevState.size !== this.state.size && this.props.onResize) {
      this.props.onResize(this.state.size);
    }
  }

  render() {
    const {
      isExpanded,
      children,
      header,
      collapsed,
      footer,
      className = '',
      resizable = true,
      showHeader = true
    } = this.props;
    const { position, size } = this.state;
    const dimensions = this.getResponsiveDimensions();

    // Normalize header config
    const headerConfig = this.normalizeHeaderConfig(header);
    // Normalize collapsed config
    const collapsedConfig = this.normalizeCollapsedConfig(collapsed);

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
        {/* Expanded Content */}
        <div className="window-content" style={{ display: isExpanded ? 'flex' : 'none' }}>
          {/* Header */}
          {showHeader && this.renderHeader(headerConfig)}

          {/* Body */}
          <div className="window-body">
            {children}
          </div>

          {/* Footer (optional) */}
          {footer && (
            <div className="window-footer">
              {footer}
            </div>
          )}
        </div>

        {/* Collapsed Content */}
        {!isExpanded && this.renderCollapsed(collapsedConfig)}
      </div>
    );
  }

  private normalizeHeaderConfig(header?: HeaderConfig | string): HeaderConfig {
    if (!header) {
      return { title: 'Window', showToggleButton: true };
    }
    if (typeof header === 'string') {
      return { title: header, showToggleButton: true };
    }
    return {
      showToggleButton: true,
      ...header
    };
  }

  private normalizeCollapsedConfig(collapsed?: CollapsedConfig | ReactNode): CollapsedConfig {
    if (!collapsed) {
      return { content: <span>+</span>, className: '' };
    }
    if (React.isValidElement(collapsed) || typeof collapsed === 'string') {
      return { content: collapsed, className: '' };
    }
    return collapsed as CollapsedConfig;
  }

  private renderHeader(headerConfig: HeaderConfig) {
    const { customContent, title, showToggleButton, toggleButtonContent, actions } = headerConfig;

    return (
      <div className="window-header">
        {customContent || <h3>{title}</h3>}

        <div className="window-header-actions">
          {actions}
          {showToggleButton && (
            <button
              className="collapse-btn"
              onClick={this.handleToggleExpanded}
              aria-label="Toggle window"
            >
              {toggleButtonContent || '_'}
            </button>
          )}
        </div>
      </div>
    );
  }

  private renderCollapsed(collapsedConfig: CollapsedConfig) {
    return (
      <button
        className={`floating-button ${collapsedConfig.className || ''}`}
        onClick={this.handleToggleExpanded}
        aria-label="Expand window"
      >
        {collapsedConfig.content}
      </button>
    );
  }

  private vwToPx = (vw: number): number => {
    return (vw / 100) * window.innerWidth;
  };

  private vhToPx = (vh: number): number => {
    return (vh / 100) * window.innerHeight;
  };

  private getResponsiveDimensions = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const baseWidth = 1920;
    const baseHeight = 1080;
    const scaleX = screenWidth / baseWidth;
    const scaleY = screenHeight / baseHeight;

    let scale = Math.min(scaleX, scaleY);

    // Scale bounds for different screen sizes
    if (screenWidth < 768) {
      scale = Math.max(0.6, Math.min(scale, 0.9));
    } else if (screenWidth < 1366) {
      scale = Math.max(0.75, Math.min(scale, 1.0));
    } else if (screenWidth < 1920) {
      scale = Math.max(0.85, Math.min(scale, 1.1));
    } else {
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

  private constrainSize = (size: Size): Size => {
    const { minSize, maxSize } = this.props;
    const dimensions = this.getResponsiveDimensions();

    const defaultMinSize = {
      width: minSize?.width || dimensions.defaultMinWidth,
      height: minSize?.height || dimensions.defaultMinHeight
    };

    const defaultMaxSize = {
      width: maxSize?.width || this.vwToPx(62.5),
      height: maxSize?.height || this.vhToPx(74.1)
    };

    return {
      width: Math.max(defaultMinSize.width, Math.min(defaultMaxSize.width, size.width)),
      height: Math.max(defaultMinSize.height, Math.min(defaultMaxSize.height, size.height))
    };
  };

  private constrainPosition = (position: Position): Position => {
    const element = this.floatingWindowRef.current;
    if (!element) return position;

    const elementWidth = element.offsetWidth;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const dimensions = this.getResponsiveDimensions();

    const width = elementWidth || dimensions.defaultWidth;
    const minVisibleWidth = dimensions.minVisibleWidth;
    const minVisibleHeight = dimensions.minVisibleHeight;

    const minX = -width + minVisibleWidth;
    const maxX = windowWidth - minVisibleWidth;
    const minY = 0;
    const maxY = windowHeight - minVisibleHeight;

    return {
      x: Math.max(minX, Math.min(maxX, position.x)),
      y: Math.max(minY, Math.min(maxY, position.y))
    };
  };

  private checkAndConstrainPosition = () => {
    const constrainedPosition = this.constrainPosition(this.state.position);
    if (constrainedPosition.x !== this.state.position.x || constrainedPosition.y !== this.state.position.y) {
      this.setState({ position: constrainedPosition });
    }
  };

  private getResizeDirection = (e: React.MouseEvent): string | null => {
    if (!this.props.resizable) return null;

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

    // Only allow bottom and right edge resizing
    if (isBottom && isRight) return 'se';
    if (isBottom && !isLeft && !isRight) return 's';
    if (isRight && !isTop && !isBottom) return 'e';

    return null;
  };

  private getResizeDirectionTouch = (touch: React.Touch): string | null => {
    if (!this.props.resizable) return null;

    const element = this.floatingWindowRef.current;
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const dimensions = this.getResponsiveDimensions();
    const edgeSize = dimensions.edgeSize * 2;

    const isLeft = x <= edgeSize;
    const isRight = x >= rect.width - edgeSize;
    const isTop = y <= edgeSize;
    const isBottom = y >= rect.height - edgeSize;

    if (isBottom && isRight) return 'se';
    if (isBottom && !isLeft && !isRight) return 's';
    if (isRight && !isTop && !isBottom) return 'e';

    return null;
  };

  private onResizeMouseDown = (e: React.MouseEvent) => {
    if (!this.props.isExpanded || !this.props.resizable) return;

    const direction = this.getResizeDirection(e);
    if (!direction) return;

    e.preventDefault();
    e.stopPropagation();

    this.setState({
      isResizing: true,
      resizeDirection: direction,
      resizeStart: {
        position: { x: e.clientX, y: e.clientY },
        size: { ...this.state.size }
      },
      hasMoved: false
    });

    document.addEventListener('mousemove', this.onResizeMouseMove);
    document.addEventListener('mouseup', this.onResizeMouseUp);
  };

  private onResizeTouchStart = (e: React.TouchEvent) => {
    if (!this.props.isExpanded || !this.props.resizable) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const direction = this.getResizeDirectionTouch(touch);
    if (!direction) return;

    e.preventDefault();
    e.stopPropagation();

    this.setState({
      isResizing: true,
      resizeDirection: direction,
      resizeStart: {
        position: { x: touch.clientX, y: touch.clientY },
        size: { ...this.state.size }
      },
      hasMoved: false
    });

    document.addEventListener('touchmove', this.onResizeTouchMove, { passive: false });
    document.addEventListener('touchend', this.onResizeTouchEnd);
  };

  private onResizeMouseMove = (e: MouseEvent) => {
    if (!this.state.isResizing || !this.state.resizeStart || !this.state.resizeDirection) return;

    const { resizeStart, resizeDirection } = this.state;
    const deltaX = e.clientX - resizeStart.position.x;
    const deltaY = e.clientY - resizeStart.position.y;

    const newSize = this.calculateNewSize(resizeStart.size, deltaX, deltaY, resizeDirection);
    const constrainedSize = this.constrainSize(newSize);

    this.setState({
      size: constrainedSize,
      hasMoved: true
    });
  };

  private onResizeTouchMove = (e: TouchEvent) => {
    if (!this.state.isResizing || !this.state.resizeStart || !this.state.resizeDirection) return;

    const touch = e.touches[0];
    const { resizeStart, resizeDirection } = this.state;
    const deltaX = touch.clientX - resizeStart.position.x;
    const deltaY = touch.clientY - resizeStart.position.y;

    const newSize = this.calculateNewSize(resizeStart.size, deltaX, deltaY, resizeDirection);
    const constrainedSize = this.constrainSize(newSize);

    this.setState({
      size: constrainedSize,
      hasMoved: true
    });
  };

  private calculateNewSize = (
    originalSize: Size,
    deltaX: number,
    deltaY: number,
    direction: string
  ): Size => {
    const newSize = { ...originalSize };

    switch (direction) {
      case 's':
        newSize.height = originalSize.height + deltaY;
        break;
      case 'e':
        newSize.width = originalSize.width + deltaX;
        break;
      case 'se':
        newSize.width = originalSize.width + deltaX;
        newSize.height = originalSize.height + deltaY;
        break;
    }

    return newSize;
  };

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

  private getCursorStyle = (direction: string): string => {
    const cursors: Record<string, string> = {
      's': 's-resize',
      'e': 'e-resize',
      'se': 'se-resize'
    };
    return cursors[direction] || 'default';
  };

  private onMouseMoveForCursor = (e: React.MouseEvent) => {
    if (!this.props.isExpanded || !this.props.resizable || this.state.isDragging || this.state.isResizing) return;

    const direction = this.getResizeDirection(e);
    const element = this.floatingWindowRef.current;

    if (element) {
      element.style.cursor = direction ? this.getCursorStyle(direction) : 'default';
    }
  };

  private onMouseDown = (e: React.MouseEvent) => {
    if (!this.props.draggable) return;

    // Check if this is a resize operation first
    if (this.props.isExpanded && this.props.resizable) {
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
      dragStart: { x: e.clientX - this.state.position.x, y: e.clientY - this.state.position.y },
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

    const constrainedPosition = this.constrainPosition(newPosition);

    this.setState({
      position: constrainedPosition,
      hasMoved: true
    });
  };

  private onMouseUp = () => {
    const wasDragging = this.state.isDragging;
    this.setState({ isDragging: false, dragStart: null });

    if (wasDragging && this.state.hasMoved) {
      setTimeout(() => {
        this.setState({ hasMoved: false });
      }, 100);
    } else {
      this.setState({ hasMoved: false });
    }

    this.removeEventListeners();
  };

  private onTouchStart = (e: React.TouchEvent) => {
    if (!this.props.draggable) return;

    // Check if this is a resize operation first
    if (this.props.isExpanded && this.props.resizable) {
      const touch = e.touches[0];
      const direction = this.getResizeDirectionTouch(touch);
      if (direction) {
        this.onResizeTouchStart(e);
        return;
      }
    }

    // Handle window dragging
    if (this.props.isExpanded) {
      const header = (e.target as Element).closest('.window-header');
      const collapseBtn = (e.target as Element).closest('.collapse-btn');
      if (!header || collapseBtn) return;
    }

    const touch = e.touches[0];
    this.setState({
      isDragging: true,
      dragStart: { x: touch.clientX - this.state.position.x, y: touch.clientY - this.state.position.y },
      hasMoved: false
    });

    document.addEventListener('touchmove', this.onTouchMove, { passive: false });
    document.addEventListener('touchend', this.onTouchEnd);
  };

  private onTouchMove = (e: TouchEvent) => {
    if (!this.state.isDragging || !this.state.dragStart) return;

    const touch = e.touches[0];
    const newPosition = {
      x: touch.clientX - this.state.dragStart.x,
      y: touch.clientY - this.state.dragStart.y
    };

    const constrainedPosition = this.constrainPosition(newPosition);

    this.setState({
      position: constrainedPosition,
      hasMoved: true
    });
  };

  private onTouchEnd = () => {
    const wasDragging = this.state.isDragging;
    this.setState({ isDragging: false, dragStart: null });

    if (wasDragging && this.state.hasMoved) {
      setTimeout(() => {
        this.setState({ hasMoved: false });
      }, 150);
    } else {
      this.setState({ hasMoved: false });
    }

    this.removeEventListeners();
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

  private handleWindowResize = () => {
    this.checkAndConstrainPosition();
  };

  private handleToggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (this.state.hasMoved) {
      return;
    }

    this.props.onToggleExpanded?.();
  };
}

export default FloatingWindow;
