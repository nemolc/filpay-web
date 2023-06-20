import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    routes: [
        {
			path: '/',
			redirect: '/index',
		},
        {
            path: '/index',
            component: () => import('../view/index.vue'),
            name: 'index'
        },
        {
            path: '/setting',
            component: () => import('../view/setting.vue'),
            children: [{
                path: '/register',
                name: 'register',
                component: () => import('../view/register.vue'),
                meta: {
                    title: '合约配置',
                    type:'register'
                },
            }, {
                path: '/withdrawalCurrency',
                name: 'withdrawalCurrency',
                component: () => import('../view/withdrawalCurrency.vue'),
                meta: {
                    title: '节点提币',
                },
            },
            {
                path: '/contractDetail',
                name: 'contractDetail',
                component: () => import('../view/contractDetail.vue'),
                meta: {
                    title: '合约详情',
                },
            }, {
                path: '/initiateProposal',
                name: 'initiateProposal',
                component: () => import('../view/contractChange/initiateProposal/index.vue'),
                meta: {
                    title: '发起提案',
                },
            },{
                path: '/viewProposal',
                name: 'viewProposal',
                component: () => import('../view/contractChange/viewProposal.vue'),
                meta: {
                    title: '查看提案',
                },
            },{
                path: '/documents/questions',
                name: 'questions',
                component: () => import('../view/documents/questions.vue'),
                meta: {
                    title: '常见问题',
                    type:'documents'
                },
            },{
                path: '/documents/FILPAY',
                name: 'FILPAY',
                component: () => import('../view/documents/FILPAY.vue'),
                meta: {
                    title: '关于FILPAY',
                    type:'documents'
                },
            },{
                path: '/prompt',
                name: 'prompt',
                component: () => import('../view/message.vue'),
            }]
        },
    ],
    history: createWebHistory()
})
export default router;