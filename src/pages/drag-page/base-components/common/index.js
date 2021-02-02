import theme from '../../../../theme.less';

export default [
    {
        title: '按钮',
        subTitle: '按钮 Button',
        children: [
            ...[
                { title: '主按钮', type: 'primary', text: '确定' },
                { title: '次按钮', text: '取消' },
                { title: '危险按钮', type: 'primary', danger: true, text: '删除' },
                { title: '虚线按钮', type: 'dashed' },
                { title: '文本按钮', type: 'text' },
                { title: '连接按钮', type: 'link' },
            ].map(item => {
                const { title, text, type, danger } = item;
                return {
                    title,

                    // 预览渲染config配置的组件
                    renderPreview: true,
                    config: {
                        __config: {
                            isContainer: false,
                        },
                        componentName: 'Button',
                        props: {
                            type,
                            danger,
                        },
                        children: [
                            {
                                __config: {
                                    draggable: false,
                                    isContainer: false,
                                },
                                componentName: 'Text',
                                props: {
                                    text: text || title,
                                },
                            },
                        ],
                    },
                };
            }),
        ],
    },
    {
        title: '栅格',
        subTitle: '栅格 Grid',
        children: [
            {
                title: '一行两列',
                // 预览渲染组件配置
                renderPreview: {
                    componentName: 'div',
                    props: {
                        style: { flex: 1, display: 'flex' },
                    },
                    children: [
                        ...[1, 1].map(() => ({
                            componentName: 'div',
                            props: {
                                style: { flex: 1, margin: 4, height: 10, background: theme.primaryColor },
                            },
                        })),
                    ],
                },
                config: {
                    componentName: 'Row',
                    children: [
                        ...[1, 1].map(() => ({
                            componentName: 'Col',
                            props: {
                                span: 12,
                            },
                            children: [
                                {
                                    componentName: 'DragHolder',
                                },
                            ],
                        })),
                    ],
                },
            },
            {
                title: '一行三列',
                renderPreview: {
                    componentName: 'div',
                    props: {
                        style: { flex: 1, display: 'flex' },
                    },
                    children: [
                        ...[1, 1, 1].map(() => ({
                            componentName: 'div',
                            props: {
                                style: { flex: 1, margin: 4, height: 10, background: theme.primaryColor },
                            },
                        })),
                    ],
                },
                config: {
                    componentName: 'Row',
                    children: [
                        ...[1, 1, 1].map(() => ({
                            componentName: 'Col',
                            props: {
                                span: 8,
                            },
                            children: [
                                {
                                    componentName: 'DragHolder',
                                },
                            ],
                        })),
                    ],
                },
            },
        ],
    },
];
