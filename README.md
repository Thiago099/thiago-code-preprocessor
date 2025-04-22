# Thiago's code preprocessor

This is a simple program made to create code snipets

![image](https://github.com/user-attachments/assets/82e17eb0-a980-4db9-8c77-25caa2b6bd05)


You can use it now via github pages:

https://thiago099.github.io/thiago-code-preprocessor


# Motivation

Even trough macros are not a good programming practice, they are sometimes useful, this program is a layer that can be used over any
language to generate code using macros

# Commands
All the commands are hoisted (which means the order you define them does not matter).

## Output
With that instruction the code until the next instruction will be a output snippet
```
#output Output Name
```

## Define
Creates a global function in the code
```
#define myFunction
```

You can call your function anywhere by using
```
@myFunction(parameter1: value1, parameter2: value2)
```

# Data
You can use data to declare an object that can be used by other functions
```
#data myData(
    parameter3: value3,
    parameter4: value4
)
```

Then you can use it like this on a function call
```
@myFunction(
    parameter1: value1,
    parameter2: value2,
    @myData
)
```
