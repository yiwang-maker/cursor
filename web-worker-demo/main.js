// 全局变量
let worker = null;
let clickCount = 0;

// 初始化Worker
function initWorker() {
    if (worker) {
        worker.terminate(); // 终止之前的worker实例
    }
    
    worker = new Worker('fibonacci-worker.js');
    
    // 监听Worker发送的消息
    worker.onmessage = function(event) {
        const { type, result, error, progress } = event.data;
        
        switch(type) {
            case 'result':
                displayResult(`🎉 Worker计算完成！<br>
                    斐波那契(${event.data.input}) = ${result}<br>
                    计算时间: ${event.data.duration}ms<br>
                    <small>主线程依然丝滑流畅！</small>`);
                break;
            case 'error':
                displayResult(`❌ 计算出错: ${error}`, 'error');
                break;
            case 'progress':
                displayResult(`⏳ 计算进度: ${progress}%`, 'loading');
                break;
        }
    };
    
    // 处理Worker错误
    worker.onerror = function(error) {
        displayResult(`💥 Worker错误: ${error.message}`, 'error');
    };
}

// 使用Worker计算斐波那契
function calculateWithWorker() {
    const number = parseInt(document.getElementById('numberInput').value);
    
    if (isNaN(number) || number < 0) {
        displayResult('❌ 请输入一个有效的非负整数', 'error');
        return;
    }
    
    displayResult('🚀 Worker正在努力计算中...', 'loading');
    
    // 初始化Worker（如果还没有的话）
    if (!worker) {
        initWorker();
    }
    
    // 向Worker发送计算任务
    worker.postMessage({
        type: 'calculate',
        number: number
    });
}

// 主线程计算斐波那契（会阻塞UI）
function calculateWithoutWorker() {
    const number = parseInt(document.getElementById('numberInput').value);
    
    if (isNaN(number) || number < 0) {
        displayResult('❌ 请输入一个有效的非负整数', 'error');
        return;
    }
    
    displayResult('😵 主线程计算中...（UI会卡顿）', 'loading');
    
    // 使用setTimeout让UI有机会更新
    setTimeout(() => {
        const startTime = performance.now();
        const result = fibonacciSync(number);
        const endTime = performance.now();
        
        displayResult(`🐌 主线程计算完成！<br>
            斐波那契(${number}) = ${result}<br>
            计算时间: ${(endTime - startTime).toFixed(2)}ms<br>
            <small>刚才UI是不是卡住了？</small>`);
    }, 100);
}

// 同步斐波那契计算（会阻塞）
function fibonacciSync(n) {
    if (n <= 1) return n;
    return fibonacciSync(n - 1) + fibonacciSync(n - 2);
}

// 测试UI响应性
function testUIResponsiveness() {
    clickCount++;
    document.getElementById('clickCount').textContent = clickCount;
    
    // 添加一些视觉反馈
    const button = event.target;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 150);
}

// 显示结果
function displayResult(message, type = 'success') {
    const resultDiv = document.getElementById('result');
    if (!resultDiv) return;
    resultDiv.innerHTML = `<div class="${type}">${message}</div>`;
}

// 挂载函数到 window，确保 HTML 按钮能访问
window.calculateWithWorker = calculateWithWorker;
window.calculateWithoutWorker = calculateWithoutWorker;
window.testUIResponsiveness = testUIResponsiveness;

