import React from 'react';
import {AppstoreOutlined, DropboxOutlined, MacCommandOutlined} from '@ant-design/icons';
import {v4 as uuid} from 'uuid';
import {cloneDeep} from 'lodash';
import base from './base';
import common from './common';
import dataInput from './data-input';

let baseComponents = [
    {title: '默认', children: base},
    {title: '通用', children: common},
    {title: '数据输入', children: dataInput},
];

// __config 说明
const defaultConfig = {
    // componentId: undefined, // 渲染时组件id
    // componentDesc: undefined, // 组件描述
    // componentType: undefined, // 组件类型，详见 getComponent方法，默认 drag-page/components -> antd -> html
    draggable: true, // 组件是否可拖拽 默认 true
    isContainer: true, // 组件是否是容器，默认true，如果是容器，则可托放入子节点
    withWrapper: false, // 是否需要拖拽包裹元素，默认 false，有些组件拖拽无效，需要包裹一下
    // wrapperStyle: undefined, // {display: 'inline-block'}, // 拖拽包裹元素样式，一般用来设置 display width height 等
    // dropAccept: undefined, // ['Text'], // 可拖入组件，默认 任意组件都可放入
    // actions: { // 事件 value 组件时间原始数据 args 自定义数据
    //     onSearch: value => args => {
    //
    //         const {
    //             pageConfig, // 页面整体配置
    //             dragPageAction, // 页面action
    //             node, // 当前组件配置
    //         } = args;
    //         if (!node.props) node.props = {};
    //
    //         node.props.options = [
    //             {value: `${value}@qq.com`},
    //             {value: `${value}@163.com`},
    //             {value: `${value}@qiye.com`},
    //         ];
    //
    //         dragPageAction.render(); // props改变了，重新出发页面渲染
    //     },
    // },
};

const componentConfigMap = {};
const componentIconMap = {};

baseComponents.forEach(item => {
    item.children.forEach(it => {
        it.children.forEach(i => {
            const {config, icon} = i;
            const {__config = defaultConfig, componentName} = config;
            componentConfigMap[componentName] = __config;
            componentIconMap[componentName] = icon;
        });
    });
});

// 两个forEach 无法合并， setDefaultOptions 中 用到了 componentConfigMap
baseComponents.forEach(item => {
    item.id = uuid();
    item.children = setDefaultOptions(item.children);
});

export default baseComponents;

// 获取组件配置 __config
export function getComponentConfig(componentName) {
    return componentConfigMap[componentName] || defaultConfig;
}

export function getComponentIcon(componentName, isContainer = true) {
    const icon = componentIconMap[componentName];
    if (!icon) return isContainer ? <DropboxOutlined/> : <MacCommandOutlined/>;
    return icon;
}

export function removeComponentConfig(nodes) {
    const dataSource = (cloneDeep(Array.isArray(nodes) ? nodes : [nodes]));

    const loop = nodes => nodes.forEach(node => {
        Reflect.deleteProperty(node, '__config');
        if (node.children) loop(node.children);
    });

    loop(dataSource);

    return dataSource[0];
}


// 设置组件配置
export function setComponentDefaultOptions(componentNode) {
    const dataSource = !Array.isArray(componentNode) ? [componentNode] : componentNode;

    const loop = nodes => {
        nodes.forEach(node => {
            if (!node.__config) node.__config = {};
            node.__config.componentId = uuid();

            const defaultConfig = getComponentConfig(node.componentName);

            // 设置默认值
            Object.entries(defaultConfig).forEach(([key, value]) => {
                if (!(key in node.__config)) node.__config[key] = value;
            });

            if (node.children?.length) {
                loop(node.children);
            }
        });
    };

    loop(dataSource);

    return componentNode;
}

export function setDefaultOptions(nodes) {
    if (!nodes?.length) return nodes;

    nodes.forEach(node => {
        if (!node.id) node.id = uuid();

        (node?.children || []).forEach(node => {
            if (!node.id) node.id = uuid();
            if (!node.icon) node.icon = <AppstoreOutlined/>;

            if (node.config) setComponentDefaultOptions(node.config);
        });
    });

    return nodes;
}
