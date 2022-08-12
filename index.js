const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

//connection to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'employeeTracker_db'
    }
);

//array for department names
const departmentArray = [];

//get elements for department names
db.query(`SELECT name FROM departments`, function(err, result) {
    if (err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            departmentArray.push(result[i].name);
        }
    }
})

//array for titles from roles
const roleNameArray = [];

//get elements for titles
db.query(`SELECT title FROM roles`, function(err, result) {
    if (err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            roleNameArray.push(result[i].title);
        }
    }
}) 

//array for salary from roles
const roleSalaryArray = [];

//get elements for salary
db.query(`SELECT salary FROM roles`, function(err, result) {
    if(err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            roleSalaryArray.push(result[i].salary);
        }
    }
})

//array for department ids from roles
const roleDepartmentArray = [];

//get elements for department ids
db.query(`SELECT department_id FROM roles`, function(err, result) {
    if(err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            roleDepartmentArray.push(result[i].department_id);
        }
    }
})

//array for first name from employees
const employeeFirstNameArray = [];

//get elements for first name
db.query(`SELECT first_name FROM employees`, function(err, result) {
    if(err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            employeeFirstNameArray.push(result[i].first_name);
        }
    }
})

//array for first and last name from employees so they can be managers if needed
const managerArray = [];

//get elements for first and last name
db.query(`SELECT CONCAT (employees.first_name, " " ,employees.last_name) AS managers FROM employees`, function(err, results) {
    if(err) throw err;
    else {
        managerArray.push('none');
        for(let i = 0; i < results.length; i++) {
            managerArray.push(results[i].managers);
        }
    }
})

//array for last names from employees
const employeeLastNameArray = [];

//get elements for last name
db.query(`SELECT last_name FROM employees`, function(err, result) {
    if(err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            employeeLastNameArray.push(result[i].last_name);
        }
    }
})

//array for employee role id
const employeeRoleArray = [];

//get elements for employee role id
db.query(`SELECT * FROM employees`, function(err, result) {
    if(err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            employeeRoleArray.push(result[i].role_id);
        }
    }
})

//array for employee manager id
const employeeManagerArray = [];

//get elements for employee manager id
db.query(`SELECT * FROM employees`, function(err, result) {
    if(err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            employeeManagerArray.push(result[i].manager_id);
        }
    }
})

//prompts for choosing what the user wants to do
const startApp = () => {
    inquirer
        .prompt([
            {
                type: 'list',
                message: 'Choose one of the following options: ',
                name: 'startAppOptions',
                choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role', 'End'],
            }
        ])

        .then(data => {
            if(data.startAppOptions === 'View all departments') {
                //shows table of id and names of departments
                db.query('SELECT * FROM departments', function (err, results) {
                    console.table(results);
                    startApp();
                })
            }
            else if(data.startAppOptions === 'View all roles') {
                //shows table of id, title, department, and salary for roles
                db.query('SELECT roles.id, roles.title, departments.name AS department, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id', function (err, results) {
                    console.table(results);
                    startApp();
                })
            }
            else if(data.startAppOptions === 'View all employees') {
                //shows table of id, first name, last name, title, department, salary, and manager for employees
                const sql = 'SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT (managers.first_name, " ", managers.last_name) AS manager FROM employees JOIN roles ON employees.role_id = roles.id JOIN departments ON roles.department_id = departments.id LEFT JOIN employees managers ON employees.manager_id = managers.id';
                db.query(sql, function (err,results) {
                    if(err) throw err;
                    else {
                        console.table(results);
                        startApp();
                    }
                })
            }
            else if(data.startAppOptions === 'Add a department') {
                departmentAdd();
            }
            else if(data.startAppOptions === 'Add a role') {
                roleAdd();
            }
            else if(data.startAppOptions === 'Add an employee') {
                employeeAdd();
            }
            else if(data.startAppOptions === 'Update an employee role') {
                updateEmployee();
            }
            else if(data.startAppOptions === 'End') {
                return;
            }
        })
}

//prompts for department questions
const departmentAdd = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                message: "What is the name of the department? ",
                name: 'departmentName',
            }
        ])

        .then(data => {
            //add department name to array
            departmentArray.push(`${data.departmentName}`);

            //insert department name to table departments
            db.connect(function(err) {
                if (err) throw err;
                const addDepartment = `INSERT INTO departments (name) VALUES ('${data.departmentName}')`;
                db.query(addDepartment, function(err, result) {
                    if(err) throw err;
                })
            })

            startApp();
        })
}

//prompts for adding roles
const roleAdd = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                message: "What is the name of the role? ",
                name: 'roleName',
            },
            {
                type: 'input',
                message: "What is the salary of the role? ",
                name: 'roleSalary',
            },
            {
                type: 'list',
                message: "Choose the department of the role: ",
                name: 'roleDepartment',
                choices: departmentArray,
            }
        ])
        
        .then(data => {
            //add role name and salary
            roleNameArray.push(`${data.roleName}`);
            roleSalaryArray.push(`${data.roleSalary}`);

            //insert into roles table: title, salary, and department id
            db.connect(function(err) {
                if (err) throw err;
                else {
                    for(let i = 0; i < departmentArray.length; i++) {
                        if(departmentArray[i] === data.roleDepartment) {
                            db.query(`SELECT * FROM departments`, function(err, result) {
                                if (err) throw err;
                                else {
                                    const addRole = `INSERT INTO roles (title, salary, department_id) VALUES ('${data.roleName}', '${data.roleSalary}', '${result[i].id}')`;
                                    //add to array the department id
                                    roleDepartmentArray.push(`${result[i].id}`);
                                    db.query(addRole, function (err, results) {
                                        if(err) throw err;
                                    })
                                }
                            })
                        }
                    }
                }
            })


            startApp();
        })
}

//prompts for adding employee
const employeeAdd = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                message: 'What is the first name of the employee? ',
                name: 'employeeFirstName',
            },
            {
                type: 'input',
                message: "What is the last name of the employee? ",
                name: 'employeeLastName',
            },
            {
                type: 'list',
                message: "Choose the role of the employee: ",
                name: 'employeeRole',
                choices: roleNameArray,
            },
            {
                type: 'list',
                message: "Who is the manager of the employee? ",
                name: 'employeeManager',
                choices: managerArray,
            }
        ])

        .then(data => {
            let roleId;
            let currentManagerId;

            //add to corresponding array the employee first name, last name and potential manager name 
            employeeFirstNameArray.push(`${data.employeeFirstName}`);
            employeeLastNameArray.push(`${data.employeeLastName}`);
            managerArray.push(`${data.employeeFirstName} ${data.employeeLastName}`);


            //store the targeted employee role id to roleId
            db.connect(function(err) {
                if(err) throw err;
                else {
                    for(let i = 0; i < roleNameArray.length; i++) {
                        if(roleNameArray[i] === data.employeeRole) {
                            db.query(`SELECT * FROM roles`, function(err, result) {
                                if(err) throw err;
                                else {
                                    //add to array the role id
                                    employeeRoleArray.push(`${result[i].id}`)
                                    roleId = `${result[i].id}`
                                }
                            })
                        }
                    }
                }

                //store the index of manager id in currentManagerId
                for(let i = 0; i < managerArray.length; i++) {
                    if(managerArray[i] === data.employeeManager) {
                        currentManagerId = i;
                        break;
                    }
                }

                //insert to table employees first name, last name, role id, and manager id(or null if none)
                db.query(`SELECT * FROM employees`, function(err, result) {
                    if(err) throw err;
                    else {
                        if(data.employeeManager !== 'none') {
                            const addEmployee = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('${data.employeeFirstName}', '${data.employeeLastName}', '${roleId}', '${result[currentManagerId-1].id}')`;
                            employeeManagerArray.push(`${result[currentManagerId-1].id}`);
                            db.query(addEmployee, function (err, result) {
                                if(err) throw err;
                            })
                        }
                        else {
                            const addEmployee = `INSERT INTO employees (first_name, last_name, role_id) VALUES ('${data.employeeFirstName}', '${data.employeeLastName}', '${roleId}')`;
                            employeeManagerArray.push(null);
                            db.query(addEmployee, function (err, result) {
                                if(err) throw err;
                            })
                        }
                    }
                })
            })

            startApp();
        })
}

//prompts to update employee role
const updateEmployee = () => {
    inquirer
        .prompt([
            {
                type: 'list',
                message: "What employee do you want to update their role? ",
                name: 'updateName',
                choices: employeeFirstNameArray,
            },
            {
                type: 'list',
                message: "What is their new role? ",
                name: 'updateRole',
                choices: roleNameArray,
            }
        ])

        .then(data => {
            //update employees table to targeted employee to change their role
            for(let i = 0; i < employeeFirstNameArray.length; i++ ) {
                if(employeeFirstNameArray[i] === data.updateName) {
                    employeeRoleArray[i] = roleNameArray.indexOf(`${data.updateRole}`) + 1;
                    const roleLocation = roleNameArray.indexOf(`${data.updateRole}`) + 1;
                    db.connect(function(err) {
                        if (err) throw err;
                        else {
                            db.query(`UPDATE employees SET role_id = ${roleLocation} WHERE first_name = '${data.updateName}'`, (err, result) => {
                                if (err) throw err;
                            })
                        }
                    })
                }
            }

            startApp();
        })
}

//start the application
startApp();