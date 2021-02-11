import {useEffect} from 'react';
import {getComponentConfig} from 'src/pages/drag-page/component-config';

export default function EditableAction(props) {
    const {
        pageConfig,
        iframeDocument,
        dragPageAction,
    } = props;

    const loop = (node, cb) => {
        const componentId = node.id;
        const className = `id_${componentId}`;
        const nodeConfig = getComponentConfig(node.componentName);
        const {editableContents} = nodeConfig;
        if (editableContents?.length) {
            editableContents.forEach(item => {
                let {selector} = item;

                let ele;
                if (selector) {
                    ele = iframeDocument.querySelector(`.${className} ${selector}`);
                } else {
                    ele = iframeDocument.querySelector(`.${className}`);
                }

                if (!ele) return;
                cb(ele, node, item);
            });
        }

        if (node.children?.length) {
            node.children.forEach(item => loop(item, cb));
        }
    };

    useEffect(() => {
        if (!iframeDocument) return;

        loop(pageConfig, (ele, node, item) => {
            let {onInput, onBlur, propsField} = item;

            let handleInput = () => undefined;

            if (propsField) {
                handleInput = (e) => {
                    if (!node.props) node.props = {};
                    node.props[propsField] = e.target.innerText;
                };
            }

            ele.setAttribute('contenteditable', 'true');
            // 清除 元素 focus 样式
            // const prevOutline = window.getComputedStyle(ele).outline;
            // const prevStyleOutline = ele.style.outline;
            //
            // ele.onfocus = () => {
            //     ele.style.outline = prevOutline;
            // };
            //
            ele.oninput = e => {
                handleInput(e);
                if (onInput) {
                    onInput(e)({node, pageConfig, dragPageAction});
                }

                // 弹框内容编辑会光标跳动
                dragPageAction.refreshProps();

                // 都会导致焦点跳动
                // dragPageAction.render();
            };
            ele.onblur = e => {
                // ele.style.outline = prevStyleOutline;
                if (onBlur) {
                    onBlur(e)({node, pageConfig, dragPageAction});
                }
                dragPageAction.render();
            };
        });

        return () => {
            loop(pageConfig, (ele) => {
                ele.setAttribute('contenteditable', 'false');
                ele.oninput = null;
                ele.onblur = null;
            });
        };
    }, [
        pageConfig,
        iframeDocument,
    ]);

    return null;
}
