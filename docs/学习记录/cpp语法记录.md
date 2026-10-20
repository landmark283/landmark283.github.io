---
title: C++ 语法记录
date: 2026-07-13
slug: cpp-syntax
tags: C++
summary: 模板、lambda、移动语义这些 C++ 里最容易记混的语法点，按主题整理成一份可以随时翻的笔记。
---

### 相关模版语法介绍

#### 模板基础语法

函数模版

```cpp
// 基本语法
template <typename T>
T max(T a, T b) {
    return a > b ? a : b;
}
// 使用（自动推导）
int x = max(3, 5);        // T = int
double y = max(3.14, 2.7); // T = double
// 也可以显式指定
int z = max<int>(3, 5.5); // 强制 T = int
```

类模版

```cpp
template <typename T>
class Box {
private:
    T value;
public:
    Box(T v) : value(v) {}
    T get() const { return value; }
};
// 使用（必须显式指定类型）
Box<int> box1(42);
Box<std::string> box2("hello");
```

类内部的成员函数也可以是模板：

```cpp
class MyClass {
public:
    template <typename T>
    void print(T value) {
        std::cout << value << std::endl;
    }
};
MyClass obj;
obj.print(42);        // T = int
obj.print("hello");   // T = const char*
```

#### 参数类型

##### ① 类型参数（Type Parameters）

```cpp
// typename 和 class 完全等价
template <typename T, class U>  // 两种都可以
class Pair {
    T first;
    U second;
};
```

##### ② 非类型参数（Non-type Parameters）

必须是**编译期常量**（整数、枚举、指针、引用等）：

```cpp
// 固定大小的数组
template <typename T, int N>
class Array {
    T data[N];  // N 必须是编译期常量
public:
    int size() const { return N; }
};
Array<int, 10> arr;  // N = 10
std::cout << arr.size();  // 输出 10
// 指针作为非类型参数
template <const char* Name>
class Logger {
    void log() { std::cout << Name << std::endl; }
};
constexpr char name[] = "MyApp";
Logger<name> logger;  // ✅ 指针必须是常量表达式
```

##### ③ 模板模板参数（Template Template Parameters）

参数本身也是模板：

```cpp
template <typename T, template <typename> class Container>
class MyClass {
    Container<T> data;  // Container 是一个模板
};
// 使用
MyClass<int, std::vector> obj;  // Container = vector
// 注意：std::vector 有两个参数（T, Allocator），需要适配
```

## 模板特化（Specialization）

### ① 全特化（Full Specialization）

所有参数都指定具体类型：

cpp

template <typename T, typename U>
class Pair {
    // 通用版本
};
// 全特化：T = int, U = double
template <>
class Pair<int, double> {
    // 特殊实现
};

### ② 偏特化（Partial Specialization）

部分参数指定，部分保持泛型：

cpp

template <typename T>
class Pair<T, int> {  // 第二个参数固定为 int
    // 特化版本
};
template <typename T>
class Pair<T*, T*> {  // 两个参数都是指针且类型相同
    // 指针版本
};

---

## 4. 函数模板的重载和特化

### ① 函数重载（Overload）

函数模板可以重载：

cpp

// 通用版本
template <typename T>
void print(T value) {
    std::cout << value << std::endl;
}
// 重载：指针版本
template <typename T>
void print(T* ptr) {
    std::cout << *ptr << std::endl;
}
// 重载：具体类型
void print(int value) {
    std::cout << "int: " << value << std::endl;
}

### ② 函数模板特化（不推荐）

函数模板也可以全特化，但通常用重载代替：

cpp

template <typename T>
void func(T t) { /* 通用实现 */ }
// 全特化（较少用）
template <>
void func<int>(int t) { /* int 特殊处理 */ }
// 更好的方式：重载
void func(int t) { /* int 特殊处理 */ }  // ✅ 更推荐

---

## 5. 可变参数模板（Variadic Templates, C++11）

### ① 递归展开

cpp

// 终止函数
void print() {
    std::cout << std::endl;
}
// 递归展开
template <typename T, typename... Args>
void print(T first, Args... rest) {
    std::cout << first << " ";
    print(rest...);  // 递归调用
}
// 使用
print(1, 3.14, "hello", 'c');
// 输出：1 3.14 hello c

### ② 折叠表达式（C++17）

更简洁的展开方式：

cpp

// C++17 折叠表达式
template <typename... Args>
void print(Args... args) {
    (std::cout << ... << args) << std::endl;  // 左折叠
    // 等价于 ((cout << arg1) << arg2) << ...
}
// 使用
print(1, 2, 3, 4);  // 输出 1234

### ③ 获取参数包大小

cpp

template <typename... Args>
void count_args(Args... args) {
    std::cout << "参数个数: " << sizeof...(args) << std::endl;
    std::cout << "类型个数: " << sizeof...(Args) << std::endl;
}

---

## 6. 高级特性

### ① SFINAE（Substitution Failure Is Not An Error）

替换失败不是错误，编译器会尝试其他重载：

cpp

// 只有当 T 有 value_type 时才会被选择
template <typename T>
void func(T, typename T::value_type* = nullptr) {
    std::cout << "有 value_type" << std::endl;
}
void func(...) {
    std::cout << "无 value_type" << std::endl;
}
struct A { using value_type = int; };
struct B {};
func(A{});  // 输出：有 value_type
func(B{});  // 输出：无 value_type

### ② `auto` 返回类型推导（C++14）

cpp

template <typename T, typename U>
auto add(T a, U b) {
    return a + b;  // 返回类型自动推导
}

### ③ 模板别名（Alias Template, C++11）

cpp

template <typename T>
using Vec = std::vector<T, std::allocator<T>>;  // 简化 vector
Vec<int> v;  // 等价于 std::vector<int, std::allocator<int>>

---

## 7. C++20 新特性

### ① 概念（Concepts）

约束模板参数：

cpp

// 定义概念
template <typename T>
concept Printable = requires(T t) {
    { t.print() } -> std::same_as<void>;
};
// 使用概念约束
template <Printable T>
void use(T obj) {
    obj.print();
}
// 简写形式
void use2(Printable auto obj) {
    obj.print();
}

### ② 简化函数模板（C++20）

cpp

// 等价于 template <typename T> void func(T t)
void func(auto t) {
    // 自动推导类型
}
