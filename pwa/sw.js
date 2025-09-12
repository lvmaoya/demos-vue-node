// PWA Service Worker
// 缓存版本号
const CACHE_NAME = 'pwa-demo-v1';
const STATIC_CACHE = 'pwa-static-v1';
const DYNAMIC_CACHE = 'pwa-dynamic-v1';

// 需要缓存的静态资源
const STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    // 可以添加更多静态资源
];

// Service Worker 安装事件
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached');
                // 强制激活新的 Service Worker
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Cache failed', error);
            })
    );
});

// Service Worker 激活事件
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // 删除旧版本的缓存
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                // 立即控制所有页面
                return self.clients.claim();
            })
    );
});

// 网络请求拦截
self.addEventListener('fetch', (event) => {
    // 只处理 GET 请求
    if (event.request.method !== 'GET') {
        return;
    }
    
    // 忽略非 HTTP(S) 请求
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        cacheFirst(event.request)
    );
});

// 缓存优先策略
async function cacheFirst(request) {
    try {
        // 首先尝试从缓存获取
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('Service Worker: Serving from cache', request.url);
            return cachedResponse;
        }
        
        // 缓存中没有，尝试网络请求
        console.log('Service Worker: Fetching from network', request.url);
        const networkResponse = await fetch(request);
        
        // 如果网络请求成功，将响应缓存起来
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            // 克隆响应，因为响应流只能使用一次
            cache.put(request, networkResponse.clone());
            console.log('Service Worker: Cached new resource', request.url);
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Network failed, trying cache', request.url);
        
        // 网络失败，尝试从缓存获取
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 如果是页面请求且缓存中没有，返回离线页面
        if (request.destination === 'document') {
            return caches.match('/index.html');
        }
        
        // 其他资源返回基本的离线响应
        return new Response(
            JSON.stringify({ 
                error: 'Offline', 
                message: '当前处于离线状态，无法获取此资源' 
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            }
        );
    }
}

// 网络优先策略（可选）
async function networkFirst(request) {
    try {
        // 首先尝试网络请求
        const networkResponse = await fetch(request);
        
        // 如果成功，更新缓存
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // 网络失败，从缓存获取
        console.log('Service Worker: Network failed, serving from cache', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 缓存中也没有，返回离线响应
        return new Response('离线状态，资源不可用', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// 仅缓存策略（适用于静态资源）
async function cacheOnly(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    return new Response('资源未缓存', {
        status: 404,
        statusText: 'Not Found'
    });
}

// 仅网络策略（适用于动态内容）
async function networkOnly(request) {
    try {
        return await fetch(request);
    } catch (error) {
        return new Response('网络错误', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// 消息处理
self.addEventListener('message', (event) => {
    console.log('Service Worker: Received message', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'GET_CACHE_NAMES':
                caches.keys().then(cacheNames => {
                    event.ports[0].postMessage(cacheNames);
                });
                break;
            case 'CLEAR_CACHE':
                caches.keys().then(cacheNames => {
                    return Promise.all(
                        cacheNames.map(name => caches.delete(name))
                    );
                }).then(() => {
                    event.ports[0].postMessage('Cache cleared');
                });
                break;
            default:
                console.log('Service Worker: Unknown message type', event.data.type);
        }
    }
});

// 后台同步（如果支持）
if ('sync' in self.registration) {
    self.addEventListener('sync', (event) => {
        console.log('Service Worker: Background sync', event.tag);
        
        if (event.tag === 'background-sync') {
            event.waitUntil(
                // 执行后台同步任务
                doBackgroundSync()
            );
        }
    });
}

// 后台同步任务
async function doBackgroundSync() {
    try {
        // 这里可以执行需要后台同步的任务
        console.log('Service Worker: Performing background sync');
        
        // 例如：同步离线时的数据
        // await syncOfflineData();
        
        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Background sync failed', error);
        return Promise.reject(error);
    }
}

// 推送通知处理
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received');
    
    const options = {
        body: event.data ? event.data.text() : 'PWA 推送通知',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%232196F3"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="30">PWA</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%232196F3"/></svg>',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {
                action: 'explore',
                title: '查看详情',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
            },
            {
                action: 'close',
                title: '关闭',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('PWA Demo 通知', options)
    );
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification click received');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // 打开应用
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // 关闭通知（已经关闭了）
        console.log('Service Worker: Notification closed');
    } else {
        // 默认行为：打开应用
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// 错误处理
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error occurred', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled promise rejection', event.reason);
});

console.log('Service Worker: Script loaded');