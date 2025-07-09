// // 这是一个简单的函数，它接受两个数字并返回它们的和
// function add(a, b) {
//   return a + b; // 这里的 a + b 就是返回值
// }

// let sum = add(2, 3); // sum 现在是 5
// console.log(`最终结果存储在sum中: ${sum}`);



// // 下面是一个函数，它接受一个名字并返回一条问候语
// function getGreeting(name) {
//   return `Hello, ${name}!`; // 返回一条专属问候
// }

// let message = getGreeting("Mr. President"); 
// console.log(message); // 输出：Hello, Mr. President!



// // 下面是一个使用数组方法的例子
// const result = [3, 12, 7, 20, 15]
//   .filter(num => num >= 10)    // 过滤出大于等于10的数
//   .map(num => num * 2)         // 每个数乘以2
//   .reduce((sum, num) => sum + num, 0); // 求和

// console.log(result); // 输出：94



// //注释
// function office() {
//     let secret = "A文件";
//     function assistant() {
//         console.log(secret); // 找到了A文件
//     }
//     assistant();
// }
// office();

// function bugDemo() {
//     let a = 1;
//     console.log(a);
//     notExist(); // 这里报错，后面不会执行
//     console.log("这句不会被执行");
// }
// bugDemo();




let treasure = "总统的金库"; // 全局作用域

function palace() {
    let treasure = "御花园的宝箱"; // palace作用域
    function secretRoom() {
        // 这里没有定义treasure，会往外找
        console.log(treasure); // 输出什么？
    }
    secretRoom();
}
palace();
