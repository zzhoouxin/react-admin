import React from 'react';
import {Tooltip} from 'antd';
import {
    MenuFoldOutlined,
    ShareAltOutlined,
    AppstoreOutlined,
    DesktopOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import config from 'src/commons/config-hoc';
import ComponentTree from '../component-tree';
import ComponentStore from '../component-store';
import SchemaEditor from '../schema-editor';
import './style.less';

export default config({
    connect: state => {
        return {
            showSide: state.dragPage.showSide,
            activeSideKey: state.dragPage.activeSideKey,
        };
    },
})(function Left(props) {
    const {
        showSide,
        activeSideKey,
        action: {dragPage: dragPageAction},
    } = props;

    function handleToolClick(key) {
        if (key === activeSideKey) {
            dragPageAction.showSide(!showSide);
            return;
        }
        dragPageAction.setActiveSideKey(key);
        dragPageAction.showSide(true);
    }

    function handleToggle() {
        const nextShowSide = !showSide;

        if (nextShowSide && !activeSideKey) {
            dragPageAction.setActiveSideKey('componentStore');
        }

        dragPageAction.showSide(nextShowSide);
    }

    const tools = [
        {
            title: '组件树',
            key: 'componentTree',
            icon: <ShareAltOutlined/>,
            component: <ComponentTree/>,
            width: 250,
        },
        {
            title: '组件库',
            key: 'componentStore',
            icon: <AppstoreOutlined/>,
            component: <ComponentStore/>,
            width: 250,
        },
        {
            title: '源码开发',
            key: 'schemaEditor',
            icon: <DesktopOutlined/>,
            component: <SchemaEditor/>,
            bottom: true,
            width: 350,
        },
    ];

    function renderTools(tools, bottom) {
        return tools.filter(item => item.bottom === bottom).map(item => {
            const {title, key, icon} = item;
            const active = showSide && key === activeSideKey;

            return (
                <Tooltip placement="right" title={title}>
                    <div styleName={`toolItem ${active ? 'active' : ''}`} onClick={() => handleToolClick(key)}>
                        {icon}
                    </div>
                </Tooltip>
            );
        });
    }

    const rightWidth = tools.find(item => item.key === activeSideKey)?.width;

    return (
        <div styleName="root">
            <div styleName="left">
                <div styleName="leftTop">
                    <Tooltip placement="right" title={showSide ? '收起' : '展开'}>
                        <div styleName="toggle toolItem" onClick={() => handleToggle()}>
                            {showSide ? <MenuFoldOutlined/> : <MenuUnfoldOutlined/>}
                        </div>
                    </Tooltip>
                    {renderTools(tools)}
                </div>
                <div styleName="leftBottom">
                    {renderTools(tools, true)}
                </div>
            </div>
            <div
                styleName="right"
                style={showSide ? {
                    flex: `0 0 ${rightWidth}px`,
                    width: rightWidth,
                } : {}}
            >
                {tools.map(item => {
                    const {key, component} = item;
                    return (
                        <div
                            id={key}
                            styleName="rightPane"
                            style={{display: showSide && key === activeSideKey ? 'block' : 'none'}}
                        >
                            {component}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
