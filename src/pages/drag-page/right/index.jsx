import React, {useRef} from 'react';
import {Tabs, Tooltip, Empty} from 'antd';
import config from 'src/commons/config-hoc';
import ComponentStyle from '../component-style';
import ComponentProps from '../component-props';
import DragBar from '../drag-bar';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ShareAltOutlined,
    AppstoreOutlined,
    DesktopOutlined,
} from '@ant-design/icons';
import './style.less';

const {TabPane} = Tabs;

export default config({
    connect: state => {
        return {
            activeTabKey: state.dragPage.activeTabKey,
            selectedNode: state.dragPage.selectedNode,
            draggingNode: state.dragPage.draggingNode,
            rightSideWidth: state.dragPage.rightSideWidth,
            rightSideExpended: state.dragPage.rightSideExpended,
        };
    },
})(function Right(props) {
    const {
        activeTabKey,
        selectedNode,
        // draggingNode,
        rightSideWidth,
        rightSideExpended,
        action: {dragPage: dragPageAction},
    } = props;

    const rootRef = useRef(null);

    function handleChange(key) {
        dragPageAction.setActiveTabKey(key);
    }

    const windowWidth = document.documentElement.clientWidth;

    function handleDragging(info) {
        const {clientX} = info;

        const {x, width: rightWidth} = rootRef.current.getBoundingClientRect();

        const width = windowWidth - clientX - 4 - (windowWidth - x - rightWidth);

        dragPageAction.setRightSideWidth(width);
    }

    function handleToggleClick() {
        dragPageAction.setRightSideExpended(!rightSideExpended);
    }

    const panes = [
        {key: 'style', title: '样式', component: <ComponentStyle/>, icon: <AppstoreOutlined/>},
        {key: 'props', title: '属性', component: <ComponentProps/>, icon: <ShareAltOutlined/>},
        {key: 'action', title: '事件', component: '事件', icon: <DesktopOutlined/>},
        {key: 'dataSource', title: '数据', component: '数据', icon: <ShareAltOutlined/>},
        {key: 'comment', title: '注释', component: '注释', icon: <ShareAltOutlined/>},
    ];

    return (
        <div
            ref={rootRef}
            styleName={`root ${rightSideExpended ? 'expended' : ''}`}
            style={{width: rightSideExpended ? rightSideWidth : 45}}
        >
            <div styleName="toolBar">
                <Tooltip
                    placement="right"
                    title={'展开'}
                    onClick={handleToggleClick}
                >
                    <div styleName="tool">
                        <MenuFoldOutlined/>
                    </div>
                </Tooltip>

                {panes.map(item => {
                    const {key, title, icon} = item;
                    const isActive = activeTabKey === key;

                    return (
                        <Tooltip
                            placement="right"
                            title={title}
                            onClick={() => {
                                handleChange(key);
                                handleToggleClick();
                            }}
                        >
                            <div key={key} styleName={`tool ${isActive ? 'active' : ''}`}>
                                {icon}
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
            <div styleName="toolTabs">
                <DragBar left onDragging={handleDragging}/>
                <Tabs
                    tabBarExtraContent={{
                        left: (
                            <div styleName="toggle" onClick={handleToggleClick}>
                                <MenuUnfoldOutlined/>
                            </div>
                        ),
                    }}
                    type="card"
                    tabBarStyle={{marginBottom: 0}}
                    activeKey={activeTabKey}
                    onChange={handleChange}
                >
                    {panes.map(item => {
                        const {key, title, component} = item;

                        return (
                            <TabPane tab={title} key={key}>
                                {selectedNode ? component : <Empty style={{marginTop: 100}} description="未选中节点"/>}
                            </TabPane>
                        );
                    })}
                </Tabs>
            </div>
        </div>
    );
});
