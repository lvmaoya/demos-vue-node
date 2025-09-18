function Person(name, age) {
  this.name = name
  this.age = age
}
Person.prototype.say = function () {
  console.log(this.name, this.age)
}
console.log(Person.prototype)
let p1 = {
    name: 'p1',
    age: 18
}
console.log(p1.__proto__)
