import React, {useState, useRef} from 'react';
import config from 'src/commons/config-hoc';
import {
    handleNodDrop,
    getDropGuidePosition,
    isDropAccept,
    setDragImage,
    getDraggingNodeIsWrapper,
} from 'src/pages/drag-page/util';
import {getComponentConfig} from '../component-config';
import {throttle} from 'lodash';
import classNames from 'classnames';

import './style.less';

export default config({
    connect: state => {
        return {
            pageConfig: state.dragPage.pageConfig,
            draggingNode: state.dragPage.draggingNode,
            componentTreeExpendedKeys: state.dragPage.componentTreeExpendedKeys,
        };
    },
})(function TreeNode(props) {
    const {
        node,
        selectedKey,
        pageConfig,
        draggingNode,
        componentTreeExpendedKeys,
        action: {dragPage: dragPageAction},
    } = props;

    let {key, name, isContainer, draggable, nodeData} = node;

    let icon = getComponentConfig(nodeData.componentName).icon;

    name = <span styleName="nodeTitle">{icon}{name}</span>;

    const hoverRef = useRef(0);
    const nodeRef = useRef(null);
    const [dragIn, setDragIn] = useState(false);
    const [accept, setAccept] = useState(true);
    const [dropPosition, setDropPosition] = useState('');

    function handleDragStart(e) {
        e.stopPropagation();

        if (!draggable) {
            e.preventDefault();
            return;
        }

        dragPageAction.setDraggingNode(nodeData);

        e.dataTransfer.setData('sourceComponentId', key);

        setDragImage(e, nodeData);
    }

    function handleDragEnter(e) {
        if (!draggable) return;

        if (draggingNode?.id === key) return;
        setDragIn(true);
        setAccept(true);
    }

    const THROTTLE_TIME = 100;
    const throttleOver = throttle(e => {
        const targetElement = e.target;

        if (!targetElement) return;

        if (draggingNode?.id === key) return;

        // 1s 后展开节点
        if (!hoverRef.current) {
            hoverRef.current = setTimeout(() => {
                if (!componentTreeExpendedKeys.some(k => k === key)) {
                    dragPageAction.setComponentTreeExpendedKeys([...componentTreeExpendedKeys, key]);
                }
            }, 300);
        }
        const {pageX, pageY, clientX, clientY} = e;

        const {position} = getDropGuidePosition({
            pageX,
            pageY,
            clientX,
            clientY,
            targetElement,
            frameDocument: window.document,
        });
        const {isTop, isBottom, isCenter} = position;

        const accept = isDropAccept({
            e,
            draggingNode,
            pageConfig,
            targetComponentId: key,
            isBefore: isTop,
            isAfter: isBottom,
            isChildren: isCenter,
        });

        setDropPosition('');
        setDragIn(true);
        setAccept(accept);

        if (!accept) return;

        dragPageAction.setDragOverInfo({
            e,
            targetElementId: key,
            isTree: true,
            isTop,
            isBottom,
            isCenter,
        });

        if (isTop) setDropPosition('top');
        if (isBottom) setDropPosition('bottom');
        if (accept && isCenter) setDropPosition('center');

        const isToSetProps = draggingNode?.toSetProps;
        const isWrapper = getDraggingNodeIsWrapper({e, draggingNode});
        const isToSelectTarget = isWrapper || isToSetProps;

        if (isToSelectTarget) {
            setDropPosition(false);
        }
    }, THROTTLE_TIME, {trailing: false});

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();

        let cursor = 'move';

        const isCopy = draggingNode?.isNewAdd;
        if (isCopy) cursor = 'copy';

        const isToSetProps = draggingNode?.toSetProps;
        if (isToSetProps) cursor = 'link';

        e.dataTransfer.dropEffect = cursor;

        if (!isToSetProps && !draggable) return;

        throttleOver(e);
    }

    function handleDragLeave(e) {
        setDragIn(false);
        setAccept(true);

        if (!draggable) return;

        dragPageAction.setDragOverInfo(null);

        if (hoverRef.current) {
            clearTimeout(hoverRef.current);
            hoverRef.current = 0;
        }
    }


    function handleDrop(e) {
        const end = () => {
            handleDragLeave(e);
            handleDragEnd();
        };

        if (!draggable) return end();

        e.preventDefault();
        e.stopPropagation();

        const iframeDocument = window.document;

        handleNodDrop({
            e,
            iframeDocument,
            end,
            pageConfig,
            draggingNode,
            dragPageAction,
        });
    }

    function handleDragEnd() {
        setAccept(true);
        if (!draggable) return;
        if (hoverRef.current) {
            clearTimeout(hoverRef.current);
            hoverRef.current = 0;
        }
        dragPageAction.setDraggingNode(null);
        dragPageAction.setDragOverInfo(null);
    }

    const isSelected = selectedKey === key;
    const isDragging = draggingNode?.id === key;

    const styleNames = classNames(dropPosition, {
        treeNode: true,
        selected: isSelected,
        dragging: isDragging,
        dragIn: dragIn && draggingNode,
        unDraggable: !draggable,
        hasDraggingNode: !!draggingNode,
        unAccept: !accept,
    });


    const positionMap = {
        top: '前',
        bottom: '后',
        center: '内',
    };
    return (
        <div
            ref={nodeRef}
            key={key}
            id={`treeNode_${key}`}
            styleName={styleNames}
            draggable
            data-component-id={key}
            data-is-container={isContainer}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
        >
            {name}
            {dropPosition ? (
                <div styleName="dragGuide" style={{display: dragIn && draggingNode ? 'flex' : 'none'}}>
                    <span>{positionMap[dropPosition]}</span>
                </div>
            ) : null}
        </div>
    );
});
