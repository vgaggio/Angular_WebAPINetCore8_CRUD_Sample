import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Employee } from './employee.model';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { environment } from '../environments/environment'; // Importa el environment
import { ToastrService } from 'ngx-toastr'; // Import Toastr


@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  apiUrlEmployee = environment.apiUrl;  // Usa el valor de environment

  constructor(private http: HttpClient, private datepipe: DatePipe, private toastr: ToastrService) {}

  getAllEmployee(): Observable<Employee[]> {
    return this.http
      .get<Employee[]>(this.apiUrlEmployee + '/getall')
      .pipe(
        map((data: Employee[]) =>
          data.map(
            (item: Employee) =>
              new Employee(
                item.id,
                item.name,
                this.datepipe
                  .transform(item.createdDate, 'dd/MM/yyyy HH:mm:ss',undefined)
                  ?.toString()
              )
          )
        )
      );
  }


  getEmployeeById(employeeId: number): Observable<Employee> {
    return this.http.get<Employee>(
      this.apiUrlEmployee + '/getbyid/?id=' + employeeId
    );
  }
  createEmployee(employee: Employee) {
    if (this.isValidEmployeeName(employee.name)) {

      employee.name = this.formatName(employee.name);

      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      };
      return this.http.post<Employee>(
        this.apiUrlEmployee + '/create',
        employee,
        httpOptions
      );
    } else {
      return throwError(() => new Error('Employee name validation failed.'));
    }
  }
  updateEmployee(employee: Employee): Observable<Employee> {
    if (this.isValidEmployeeName(employee.name)) {

      employee.name = this.formatName(employee.name);

      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      };
      return this.http.put<Employee>(
        this.apiUrlEmployee + '/update',
        employee,
        httpOptions
      );
    } else {
      return throwError(() => new Error('Employee name validation failed.'));
    }
  }

  deleteEmployeeById(employeeid: number) {
    let endPoints = '/posts/1';
    return this.http.delete(this.apiUrlEmployee + '/Delete/?id=' + employeeid);
  }

  // Validaciones a realizar sobre el nombre del empleado
  private isValidEmployeeName(name: string): boolean {
    const maxLength = 100;

    // 1: Chequeo que el nombre no contenga números
    if (/\d/.test(name)) {
      this.toastr.error('El nombre del empleado no debe contener números.', 'Error de validación');
      return false;
    }

    // 4: Se verifica que todas las partes del nombre tengan más de 1 caracter
    const nameParts = name.split(' ');
    for (let part of nameParts) {
      if (part.length <= 1) {
        this.toastr.error('Los nombres y apellidos del empleado debe tener una longitud mayor a 1 letra.', 'Error de validación');
        return false;
      }
    }

    // 5: Se verifica máxima longitud de nombre 100 caracteres
    if (name.length > 100) {
      this.toastr.error('El nombre del empleado no puede contener más de 100 letras.', 'Error de validación');
      return false;
    }

    return true;
  }

  // Format the name: First name with capital first letter, last name fully uppercase
  private formatName(name: string): string {
    const nameParts = name.split(' ');
    const formattedParts = nameParts.map((part, index) => {
      return index === nameParts.length - 1 // If last part is surname
        ? part.toUpperCase() // Surname in uppercase
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(); // First name parts capitalized
    });
    return formattedParts.join(' ');
  }
}
