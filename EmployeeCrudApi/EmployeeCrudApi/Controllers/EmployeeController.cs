using EmployeeCrudApi.Data;
using EmployeeCrudApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EmployeeCrudApi.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private ApplicationDbContext _context;

        public EmployeeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1: Chequeo de ausencia de números
        private bool CheckForNumbersInName(string name)
        {
            return name.Any(char.IsDigit);
        }

        // 2: Formatear el nombre y apellido
        private string FormatName(string name)
        {
            var parts = name.Split(' ');
            for (int i = 0; i < parts.Length; i++)
            {
                if (i == parts.Length - 1)
                {
                    // El apellido en mayúsculas (última palabra)
                    parts[i] = parts[i].ToUpper();
                }
                else
                {
                    // Nombres con la primera letra mayúscula
                    parts[i] = char.ToUpper(parts[i][0]) + parts[i].Substring(1).ToLower();
                }
            }
            return string.Join(" ", parts);
        }

        // 3: Chequeo de nombre duplicado
        private bool IsNameDuplicate(string name)
        {
            // Se realiza la comparación en minúsculas para garantizar la ausencia de duplicados
            return _context.Employees.Any(e => e.Name.ToLower() == name.ToLower());
        }

        // 4: Chequeo que todas las partes del nombre tengan más de 1 caracter
        private bool AreNamePartsValid(string name)
        {
            var parts = name.Split(' ');
            return parts.All(p => p.Length > 1);
        }

        // 5: Chequeo máxima longitud 100 caracteres
        private bool IsNameLengthValid(string name)
        {
            return name.Length <= 100;
        }

        // 6: Chequeo de repetición excesiva de caracteres
        private bool NameHasExcessiveRepeatedCharacters(string name)
        {
            int counter = 1;
            for (int i = 1; i < name.Length; i++)
            {
                if (name[i] == name[i-1])
                {
                    counter++;
                    if (counter > 2)
                        return true;
                }
                else
                {
                    counter = 1;
                }
            }

            return false;
        }

        [HttpGet]
        public async Task<List<Employee>> GetAll()
        {
            return await _context.Employees.ToListAsync();
        }

        [HttpGet]
        public async Task<Employee> GetById(int id)
        {
            return await _context.Employees.FindAsync(id);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Employee employee)
        {
            // 1: Chequeo que el nombre no contenga números
            if(CheckForNumbersInName(employee.Name))
            {
                return BadRequest("El nombre del empleado no debe contener números.");
            }

            // 3: Se verifica que el nombre no esté duplicado
            if(IsNameDuplicate(employee.Name))
            {
                return BadRequest("El empleado ya se encuentra registrado.");
            }

            //4: Se verifica que todas las partes del nombre tengan más de 1 caracter
            if(!AreNamePartsValid(employee.Name))
            {
                return BadRequest("Los nombres y apellidos del empleado debe tener una longitud mayor a 1 letra.");
            }

            // 5: Se verifica máxima longitud de nombre 100 caracteres
            if(!IsNameLengthValid(employee.Name))
            {
                return BadRequest("El nombre del empleado no puede contener más de 100 letras.");
            }

            // 6: Se verifica que el nombre no contenga caracteres repetidos de forma excesiva
            if (NameHasExcessiveRepeatedCharacters(employee.Name))
            {
                return BadRequest("El nombre del empleado contiene caracteres repetidos de forma excesiva.");
            }


            employee.CreatedDate = DateTime.Now;

            // 2: Se escribe apellido en mayúsculas y nombres con la primera letra mayúscula y resto minúscula
            employee.Name = FormatName(employee.Name);

            await _context.Employees.AddAsync(employee);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] Employee employee)
        {
            // 1: Chequeo que el nombre no contenga números
            if(CheckForNumbersInName(employee.Name))
            {
                return BadRequest("El nombre del empleado no debe contener números.");
            }

            // 3: Se verifica que el nombre no esté duplicado
            if(IsNameDuplicate(employee.Name))
            {
                return BadRequest("El empleado ya se encuentra registrado.");
            }

            // 4: Se verifica que todas las partes del nombre tengan más de 1 caracter
            if(!AreNamePartsValid(employee.Name))
            {
                return BadRequest("Los nombres y apellidos del empleado debe tener una longitud mayor a 1 letra.");
            }

            // 5: Se verifica máxima longitud de nombre 100 caracteres
            if(!IsNameLengthValid(employee.Name))
            {
                return BadRequest("El nombre del empleado no puede contener más de 100 letras.");
            }

            // 6: Se verifica que el nombre no contenga caracteres repetidos de forma excesiva
            if (NameHasExcessiveRepeatedCharacters(employee.Name))
            {
                return BadRequest("El nombre del empleado contiene caracteres repetidos de forma excesiva.");
            }

            Employee employeeToUpdate = await _context.Employees.FindAsync(employee.Id);

            // 2: Se escribe apellido en mayúsculas y nombres con la primera letra mayúscula y resto minúscula
            employeeToUpdate.Name = FormatName(employee.Name);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete]
        public async Task Delete(int id)
        {
            var employeeToDelete = await _context.Employees.FindAsync(id);
            _context.Remove(employeeToDelete);
            await _context.SaveChangesAsync();
        }
    }
}
