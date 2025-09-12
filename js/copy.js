let a = {
    name: 'a',
    age: 18,
    friend: {
        name: 'b',
        age: 19
    }
}
let b = {
    ...a
}
a.friend.name = 'c'
a.age = 20
console.log(a)
console.log(b)
 