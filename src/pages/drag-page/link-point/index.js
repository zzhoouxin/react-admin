import React, {useEffect, useRef} from 'react';
import config from 'src/commons/config-hoc';
import {getEleCenterInWindow, findNodeById} from 'src/pages/drag-page/util';
import {v4 as uuid} from 'uuid';

import styles from './style.less';

export default config({
    connect: state => {
        return {
            pageConfig: state.dragPage.pageConfig,
            selectedNode: state.dragPage.selectedNode,
            iFrameDocument: state.dragPage.iFrameDocument,
        };
    },
})(function LinkProps(props) {
    const {
        selectedNode,
        iFrameDocument,
        action: {dragPage: dragPageAction},
        className,
        sourcePointEle,
        onDragStart,
        movingPoint,
        pageConfig,
        ...others
    } = props;

    const propsToSet = selectedNode?.__config?.propsToSet;

    const startRef = useRef(null);
    const lineRef = useRef(null);
    const dragImgRef = useRef(null);
    const pointRef = useRef(null);

    function handleDragStart(e) {
        onDragStart && onDragStart(e);
        e.stopPropagation();
        // e.preventDefault();
        const componentId = selectedNode?.__config?.componentId;

        if (!propsToSet) return;
        let str = JSON.stringify(propsToSet);

        str = str.replace(/\$\{componentId}/g, componentId);

        e.dataTransfer.setData('propsToSet', str);

        dragPageAction.setDraggingNode({propsToSet: true});

        const center = getEleCenterInWindow(sourcePointEle || e.target);
        if (center) {
            const {x: startX, y: startY} = center;
            startRef.current = {startX, startY};
        }

        e.dataTransfer.setDragImage(dragImgRef.current, 0, 0);

        // 显示所有 link line
        selectedNode.__config.showLink = true;
        dragPageAction.setSelectedNode({...selectedNode});
    }

    function handleDragEnd(e) {
        e.preventDefault();
        e.stopPropagation();

        if (movingPoint) {
            const {targetComponentId, propsKey, propsValue} = movingPoint;

            const node = findNodeById(pageConfig, targetComponentId);
            if (node) {
                const props = node.props || {};

                Object.entries(props)
                    .forEach(([key, value]) => {
                        if (key === propsKey && value === propsValue) {
                            Reflect.deleteProperty(props, key);
                            props.key = uuid();
                        }
                    });
                dragPageAction.render();
            }
        }

        selectedNode.__config.showLink = true;
        dragPageAction.setSelectedNode({...selectedNode});
    }

    function handleOver(e) {
        e.preventDefault();
        if (!startRef.current) return;

        const {pageX, pageY, clientX, clientY} = e;
        const endX = pageX || clientX;
        const endY = pageY || clientY;

        showDraggingArrowLine({endX, endY});
    }

    function handleIframeOver(e) {
        e.preventDefault();
        if (!startRef.current) return;

        const {pageX, pageY, clientX, clientY} = e;
        let endX = pageX || clientX;
        let endY = pageY || clientY;
        const iframe = document.getElementById('dnd-iframe');
        const rect = iframe.getBoundingClientRect();
        const {x, y} = rect;

        endX = endX + x;
        endY = endY + y;

        showDraggingArrowLine({endX, endY});
    }

    function showDraggingArrowLine({endX, endY}) {
        const options = {
            ...startRef.current,
            endX,
            endY,
            key: 'dragging',
        };

        lineRef.ref = options;
        dragPageAction.showDraggingArrowLine(options);
    }

    function handleClick() {
        selectedNode.__config.showLink = !selectedNode.__config.showLink;
        dragPageAction.setSelectedNode({...selectedNode});
    }

    useEffect(() => {
        if (!iFrameDocument) return;

        // 捕获方式
        iFrameDocument.addEventListener('dragover', handleIframeOver, true);
        window.addEventListener('dragover', handleOver, true);
        return () => {
            iFrameDocument.removeEventListener('dragover', handleIframeOver, true);
            window.removeEventListener('dragover', handleOver, true);
        };
    }, [iFrameDocument]);

    return (
        <div
            className={[className, styles.root].join(' ')}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            {...others}
        >
            <img ref={dragImgRef} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=" alt=""/>

            <div className={styles.point} ref={pointRef}/>
        </div>
    );
});