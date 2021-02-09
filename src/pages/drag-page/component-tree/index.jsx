import React, {useState, useEffect, useRef} from 'react';
import {Tree, Tooltip} from 'antd';
import {
    AppstoreOutlined,
    ShrinkOutlined,
    ArrowsAltOutlined,
} from '@ant-design/icons';
import config from 'src/commons/config-hoc';
import TreeNode from './TreeNode';
import {scrollElement, getParentIds} from '../util';
import Pane from '../pane';
import classNames from 'classnames';
import DragBar from 'src/pages/drag-page/drag-bar';
import {getComponentDisplayName} from 'src/pages/drag-page/base-components';

import './style.less';

export default config({
    connect: state => {
        return {
            pageConfig: state.dragPage.pageConfig,
            draggingNode: state.dragPage.draggingNode,
            selectedNodeId: state.dragPage.selectedNodeId,
            componentTreeExpendedKeys: state.dragPage.componentTreeExpendedKeys,
            componentTreeWidth: state.dragPage.componentTreeWidth,
        };
    },
})(function ComponentTree(props) {
    const {
        pageConfig,
        selectedNodeId,
        componentTreeExpendedKeys,
        componentTreeWidth,
        draggingNode,
        action: {dragPage: dragPageAction},
    } = props;
    const [treeData, setTreeData] = useState([]);
    const [nodeCount, setNodeCount] = useState(0);
    const [allKeys, setAllKeys] = useState([]);
    const [isAllExpanded, setIsAllExpanded] = useState(false);
    const mainRef = useRef(null);

    useEffect(() => {
        if (!pageConfig) return;

        const treeData = {};
        let nodeCount = 0;
        const allKeys = [];
        const loop = (prev, next) => {
            const {__config = {}, props, children} = prev;
            let {
                componentId,
                isContainer,
                draggable,
                childrenDraggable,
            } = __config;

            if (props?.isDraggable === false) {
                draggable = false;
            }

            next.title = ''; // 为了鼠标悬停，不显示原生 html title
            next.name = getComponentDisplayName(prev);
            if (typeof next.name === 'function') next.name = next.name({node: prev, pageConfig});
            next.isContainer = isContainer;
            next.key = componentId;
            next.draggable = draggable;
            next.nodeData = prev;

            allKeys.push(componentId);
            nodeCount++;

            if (children && children.length) {
                next.children = children.map(() => ({}));

                children.forEach((item, index) => {

                    if (!childrenDraggable) {
                        item.__config.draggable = false;
                    }

                    loop(item, next.children[index]);
                });
            }
        };

        loop(pageConfig, treeData);

        setTreeData([treeData]);
        setNodeCount(nodeCount);
        setAllKeys(allKeys);

    }, [pageConfig]);

    function handleSelected([key]) {
        dragPageAction.setSelectedNodeId(key);
    }

    function renderNode(nodeData) {

        return <TreeNode selectedKey={selectedNodeId} node={nodeData}/>;
    }

    function handleExpand(keys) {
        dragPageAction.setComponentTreeExpendedKeys(keys);
    }

    useEffect(() => {
        const keys = getParentIds(pageConfig, selectedNodeId) || [];
        // 去重
        const nextKeys = Array.from(new Set([...componentTreeExpendedKeys, ...keys, selectedNodeId]));

        dragPageAction.setComponentTreeExpendedKeys(nextKeys);
    }, [selectedNodeId]);

    useEffect(() => {
        const containerEle = mainRef.current;

        if (!containerEle) return;
        const element = containerEle.querySelector(`#treeNode_${selectedNodeId}`);

        if (element) return scrollElement(containerEle, element);

        // 等待树展开
        setTimeout(() => {
            const element = containerEle.querySelector(`#treeNode_${selectedNodeId}`);

            scrollElement(containerEle, element);
        }, 200);

    }, [selectedNodeId]);

    function handleDragging(info) {
        const {clientX} = info;

        dragPageAction.setComponentTreeWidth(clientX - 56);
    }

    const styleName = classNames({
        root: true,
        hasDraggingNode: !!draggingNode,
    });


    return (
        <Pane
            header={
                <div styleName="header">
                    <div>
                        <AppstoreOutlined style={{marginRight: 4}}/>
                        组件树({nodeCount})
                    </div>
                    <div>
                        <Tooltip placement="top" title={isAllExpanded ? '收起所有' : '展开所有'}>
                            <div
                                styleName="tool"
                                onClick={() => {
                                    const nextKeys = isAllExpanded ? [] : allKeys;
                                    dragPageAction.setComponentTreeExpendedKeys(nextKeys);
                                    setIsAllExpanded(!isAllExpanded);
                                }}
                            >
                                {isAllExpanded ? <ShrinkOutlined/> : <ArrowsAltOutlined/>}
                            </div>
                        </Tooltip>
                    </div>
                </div>
            }
        >
            <div
                styleName={styleName}
                ref={mainRef}
                style={{width: componentTreeWidth}}
            >
                <DragBar onDragging={handleDragging}/>
                <Tree
                    expandedKeys={componentTreeExpendedKeys}
                    onExpand={handleExpand}
                    blockNode

                    draggable
                    treeData={treeData}
                    titleRender={renderNode}

                    selectable
                    selectedKeys={[selectedNodeId]}
                    onSelect={handleSelected}
                />
            </div>
        </Pane>
    );
});
