const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'employeeTracker_db'
    }
);

const departmentArray = [];

db.query(`SELECT name FROM departments`, function(err, result) {
    if (err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            departmentArray.push(result[i].name);
        }
    }
})

const roleNameArray = [];

db.query(`SELECT title FROM roles`, function(err, result) {
    if (err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            roleNameArray.push(result[i].title);
        }
    }
}) 

const roleSalaryArray = [];

db.query(`SELECT salary FROM roles`, function(err, result) {
    if(err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            roleSalaryArray.push(result[i].salary);
        }
    }
})

const roleDepartmentArray = [];

db.query(`SELECT department_id FROM roles`, function(err, result) {
    if(err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            roleDepartmentArray.push(result[i].department_id);
        }
    }
})

const employeeFirstNameArray = [];

db.query(`SELECT first_name FROM employees`, function(err, result) {
    if(err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            employeeFirstNameArray.push(result[i].first_name);
        }
    }
})

const managerArray = [];


db.query(`SELECT CONCAT (employees.first_name, " " ,employees.last_name) AS managers FROM employees`, function(err, results) {
    if(err) throw err;
    else {
        managerArray.push('none');
        for(let i = 0; i < results.length; i++) {
            managerArray.push(results[i].managers);
        }
    }
})

const employeeLastNameArray = [];

db.query(`SELECT last_name FROM employees`, function(err, result) {
    if(err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            employeeLastNameArray.push(result[i].last_name);
        }
    }
})

const employeeRoleArray = [];

db.query(`SELECT * FROM employees`, function(err, result) {
    if(err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            employeeRoleArray.push(result[i].role_id);
        }
    }
})

const employeeManagerArray = [];

db.query(`SELECT * FROM employees`, function(err, result) {
    if(err) throw err;
    else {
        for(let i = 0; i < result.length; i++) {
            employeeManagerArray.push(result[i].manager_id);
        }
    }
})

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
                db.query('SELECT * FROM departments', function (err, results) {
                    console.table(results);
                    startApp();
                })
            }
            else if(data.startAppOptions === 'View all roles') {
                db.query('SELECT roles.id, roles.title, departments.name AS department, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id', function (err, results) {
                    console.table(results);
                    startApp();
                })
            }
            else if(data.startAppOptions === 'View all employees') {
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
            departmentArray.push(`${data.departmentName}`);

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
            roleNameArray.push(`${data.roleName}`);
            roleSalaryArray.push(`${data.roleSalary}`);
            roleDepartmentArray.push(`${data.roleDepartment}`);

            db.connect(function(err) {
                if (err) throw err;
                else {
                    for(let i = 0; i < departmentArray.length; i++) {
                        if(departmentArray[i] === data.roleDepartment) {
                            db.query(`SELECT * FROM departments`, function(err, result) {
                                if (err) throw err;
                                else {
                                    const addRole = `INSERT INTO roles (title, salary, department_id) VALUES ('${data.roleName}', '${data.roleSalary}', '${result[i].id}')`;
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
            employeeFirstNameArray.push(`${data.employeeFirstName}`);
            employeeLastNameArray.push(`${data.employeeLastName}`);
            employeeRoleArray.push(`${data.employeeRole}`);
            managerArray.push(`${data.employeeFirstName} ${data.employeeLastName}`);

            db.connect(function(err) {
                if(err) throw err;
                else {
                    for(let i = 0; i < roleNameArray.length; i++) {
                        if(roleNameArray[i] === data.employeeRole) {
                            db.query(`SELECT * FROM roles`, function(err, result) {
                                if(err) throw err;
                                else {
                                    roleId = `${result[i].id}`
                                }
                            })
                        }
                    }
                }

                for(let i = 0; i < managerArray.length; i++) {
                    if(managerArray[i] === data.employeeManager) {
                        currentManagerId = i;
                        break;
                    }
                }

                db.query(`SELECT * FROM employees`, function(err, result) {
                    if(err) throw err;
                    else {
                        if(data.employeeManager !== 'none') {
                            const addEmployee = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('${data.employeeFirstName}', '${data.employeeLastName}', '${roleId}', '${result[currentManagerId-1].id}')`;
                            db.query(addEmployee, function (err, result) {
                                if(err) throw err;
                            })
                        }
                        else {
                            const addEmployee = `INSERT INTO employees (first_name, last_name, role_id) VALUES ('${data.employeeFirstName}', '${data.employeeLastName}', '${roleId}')`;
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

startApp();