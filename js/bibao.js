// function outer (){
//     let count = 1;
//     function inner (){
//         count++;
//         console.log(count);
//     }
//     return inner;
// }
// let a = outer();
// a()
// a()
// a()

// 私有数据封装
function outer (){
    let count = 1;
    function add (){
        count++;
        console.log(count);
    }
    function minus (){
        count--;
        console.log(count);
    }
    return {
        add,
        minus,
        getCount (){
            return count;
        }
    };
}
let a = outer();
a.add()
a.add()
console.log(a.getCount());
