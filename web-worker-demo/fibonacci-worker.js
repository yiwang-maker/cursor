// Worker内部的全局作用域是DedicatedWorkerGlobalScope
// 这里没有DOM访问权限，没有window对象

console.log('🔧 Fibonacci Worker 已启动！');

// 监听主线程发送的消息
self.onmessage = function(event) {
    console.log('📨 Worker收到消息:', event.data);
    
    const { type, number } = event.data;
    
    switch(type) {
        case 'calculate':
            calculateFibonacci(number);
            break;
        default:
            // 发送错误消息回主线程
            self.postMessage({
                type: 'error',
                error: `未知的消息类型: ${type}`
            });
    }
};

// 斐波那契计算函数（带进度报告）
function calculateFibonacci(n) {
    const startTime = performance.now();
    
    try {
        // 对于大数字，我们使用迭代方法而不是递归，避免栈溢出
        let result;
        
        if (n <= 1) {
            result = n;
        } else if (n < 50) {
            // 小数字用递归，可以看到明显的计算时间
            result = fibonacciRecursive(n, 0);
        } else {
            // 大数字用迭代，效率更高
            result = fibonacciIterative(n);
        }
        
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        
        // 发送结果回主线程
        self.postMessage({
            type: 'result',
            input: n,
            result: result,
            duration: duration
        });
        
        console.log(`✅ 计算完成: fib(${n}) = ${result}, 用时: ${duration}ms`);
        
    } catch (error) {
        // 发送错误信息回主线程
        self.postMessage({
            type: 'error',
            error: error.message
        });
        console.error('❌ Worker计算错误:', error);
    }
}

// 递归版本（会比较慢，适合演示）
function fibonacciRecursive(n, depth = 0) {
    // 每隔一定深度报告进度（避免过于频繁）
    if (depth === 0 && n > 35) {
        // 对于较大的数字，我们模拟进度报告
        setTimeout(() => {
            self.postMessage({
                type: 'progress',
                progress: 25
            });
        }, 100);
        
        setTimeout(() => {
            self.postMessage({
                type: 'progress',
                progress: 50
            });
        }, 500);
        
        setTimeout(() => {
            self.postMessage({
                type: 'progress',
                progress: 75
            });
        }, 1000);
    }
    
    if (n <= 1) return n;
    return fibonacciRecursive(n - 1, depth + 1) + fibonacciRecursive(n - 2, depth + 1);
}

// 迭代版本（高效）
function fibonacciIterative(n) {
    if (n <= 1) return n;
    
    let a = 0, b = 1;
    
    for (let i = 2; i <= n; i++) {
        // 报告进度
        if (i % Math.floor(n / 10) === 0) {
            self.postMessage({
                type: 'progress',
                progress: Math.floor((i / n) * 100)
            });
        }
        
        let temp = a + b;
        a = b;
        b = temp;
        
        // 对于超大数字，使用BigInt避免精度丢失
        if (b > Number.MAX_SAFE_INTEGER) {
            return calculateWithBigInt(n);
        }
    }
    
    return b;
}

// 使用BigInt处理超大数字
function calculateWithBigInt(n) {
    if (n <= 1) return BigInt(n);
    
    let a = 0n, b = 1n;
    
    for (let i = 2; i <= n; i++) {
        if (i % Math.floor(n / 20) === 0) {
            self.postMessage({
                type: 'progress',
                progress: Math.floor((i / n) * 100)
            });
        }
        
        let temp = a + b;
        a = b;
        b = temp;
    }
    
    return b.toString(); // 转换为字符串，因为JSON不支持BigInt
}

// Worker错误处理
self.onerror = function(error) {
    console.error('💥 Worker内部错误:', error);
    self.postMessage({
        type: 'error',
        error: `Worker内部错误: ${error.message}`
    });
};

console.log('🎯 Worker事件监听器已设置完成！');

