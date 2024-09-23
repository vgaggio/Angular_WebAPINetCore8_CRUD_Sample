import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';
import { DatePipe } from '@angular/common';
import { ToastrService, ToastrModule } from 'ngx-toastr';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;
  let datePipe: DatePipe;
  let toastr: ToastrService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ToastrModule.forRoot()],
      providers: [
        EmployeeService,
        DatePipe,
        ToastrService
      ]
    });

    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
    datePipe = TestBed.inject(DatePipe);
    toastr = TestBed.inject(ToastrService);
    spyOn(toastr, 'error'); // Spy on toastr "error" method
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve all employees', () => {
    const today = new Date('2024/09/12 17:43:50');
    const expectedDateTime = datePipe.transform(today, 'dd/MM/yyyy HH:mm:ss', undefined) ?? '';  // Consistente con el servicio

    const dummyEmployees: Employee[] = [
      new Employee(1, 'John Doe', expectedDateTime),
      new Employee(2, 'Jane Smith', expectedDateTime)
    ];

    service.getAllEmployee().subscribe(employees => {
      expect(employees.length).toBe(2);
      employees.forEach((employee, index) => {
        // Agrega depuración aquí
        console.log('Employee createdDate:', datePipe.transform(employee.createdDate, 'dd/MM/yyyy HH:mm:ss', undefined)?? '');  // Imprimir el valor generado por el servicio
        console.log('Dummy employee createdDate:', datePipe.transform(dummyEmployees[index].createdDate, 'MM/dd/yyyy HH:mm:ss', undefined)?? '');   // Imprimir el valor esperado

        expect(datePipe.transform(employee.createdDate, 'dd/MM/yyyy HH:mm:ss', undefined)?? '').toEqual(datePipe.transform(dummyEmployees[index].createdDate, 'MM/dd/yyyy HH:mm:ss', undefined)?? '');  // Compara la fecha completa
      });
    });

    const req = httpMock.expectOne(`${service.apiUrlEmployee}/getall`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyEmployees);
  });

  it('should fail to create employee when name contains numbers', () => {
    const invalidEmployee = new Employee (1, 'John 1', '');
    service.createEmployee(invalidEmployee).subscribe({
      next: () => fail('Expected validation error'),
      error: (error: Error) => {
        expect(error.message).toContain('Employee name validation failed.');
      }
    });

    expect(toastr.error).toHaveBeenCalledWith('El nombre del empleado no debe contener números.', 'Error de validación');

  });

  it('should fail to create employee when a part of name is of length 1', () => {
    const invalidEmployee = new Employee (1, 'J D', '');
    service.createEmployee(invalidEmployee).subscribe({
      next: () => fail('Expected validation error'),
      error: (error: Error) => {
        expect(error.message).toContain('Employee name validation failed.');
      }
    });

    expect(toastr.error).toHaveBeenCalledWith('Los nombres y apellidos del empleado debe tener una longitud mayor a 1 letra.', 'Error de validación');

  });

  it('should fail to create employee when name is longer than 100', () => {
    const invalidEmployee = new Employee (1, 'A'.repeat(120), '');
    service.createEmployee(invalidEmployee).subscribe({
      next: () => fail('Expected validation error'),
      error: (error: Error) => {
        expect(error.message).toContain('Employee name validation failed.');
      }
    });

    expect(toastr.error).toHaveBeenCalledWith('El nombre del empleado no puede contener más de 100 letras.', 'Error de validación');

  });

  it('should format employee name when creating an employee', () => {
    const employee = new Employee(1, 'john doe', '');
  
    const formatNameSpy = spyOn<any>(service, 'formatName').and.callThrough(); 
  
    service.createEmployee(employee).subscribe((response) => {
      expect(employee.name).toEqual('John DOE');
    });
  
    const req = httpMock.expectOne(`${service.apiUrlEmployee}/create`);
    expect(req.request.method).toBe('POST');
  
    // Simulate a successful response from the backend
    req.flush(employee);
    
    expect(formatNameSpy).toHaveBeenCalledWith('john doe');
  });

  it('should handle API error on createEmployee', () => {
    const employee = new Employee(1, 'John Doe', '');
  
    // Simulate an error message from the backend
    const errorMessage = 'El empleado ya se encuentra registrado';
    const errorResponse = { status: 400, statusText: 'Bad Request' };
  
    // Call the service method
    service.createEmployee(employee).subscribe({
      next: () => fail('Expected an error, but got success response'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
      }
    });
  
    // Expect an API call
    const req = httpMock.expectOne(`${service.apiUrlEmployee}/create`);
    expect(req.request.method).toBe('POST');
  
    // Simulate an API error response (passing the error as a string directly)
    req.flush(errorMessage, errorResponse);
  
    // Verify that the ToastrService error was called
    expect(toastr.error).toHaveBeenCalledWith(errorMessage, 'Error al crear empleado');
  });

  // ------------------------------------------------------------------

  it('should fail to update employee when name contains numbers', () => {
    const invalidEmployee = new Employee (1, 'John 1', '');
    service.updateEmployee(invalidEmployee).subscribe({
      next: () => fail('Expected validation error'),
      error: (error: Error) => {
        expect(error.message).toContain('Employee name validation failed.');
      }
    });

    expect(toastr.error).toHaveBeenCalledWith('El nombre del empleado no debe contener números.', 'Error de validación');

  });

  it('should fail to update employee when a part of name is of length 1', () => {
    const invalidEmployee = new Employee (1, 'J D', '');
    service.updateEmployee(invalidEmployee).subscribe({
      next: () => fail('Expected validation error'),
      error: (error: Error) => {
        expect(error.message).toContain('Employee name validation failed.');
      }
    });

    expect(toastr.error).toHaveBeenCalledWith('Los nombres y apellidos del empleado debe tener una longitud mayor a 1 letra.', 'Error de validación');

  });

  it('should fail to update employee when name is longer than 100', () => {
    const invalidEmployee = new Employee (1, 'A'.repeat(120), '');
    service.updateEmployee(invalidEmployee).subscribe({
      next: () => fail('Expected validation error'),
      error: (error: Error) => {
        expect(error.message).toContain('Employee name validation failed.');
      }
    });

    expect(toastr.error).toHaveBeenCalledWith('El nombre del empleado no puede contener más de 100 letras.', 'Error de validación');

  });

  it('should format employee name when updating an employee', () => {
    const employee = new Employee(1, 'john doe', '');
  
    const formatNameSpy = spyOn<any>(service, 'formatName').and.callThrough(); 
  
    service.updateEmployee(employee).subscribe((response) => {
      expect(employee.name).toEqual('John DOE');
    });
  
    const req = httpMock.expectOne(`${service.apiUrlEmployee}/update`);
    expect(req.request.method).toBe('PUT');
  
    // Simulate a successful response from the backend
    req.flush(employee);
    
    expect(formatNameSpy).toHaveBeenCalledWith('john doe');
  });

  it('should handle API error on updateEmployee', () => {
    const employee = new Employee(1, 'John Doe', '');
  
    // Simulate an error message from the backend
    const errorMessage = 'El empleado ya se encuentra registrado';
    const errorResponse = { status: 400, statusText: 'Bad Request' };
  
    // Call the service method
    service.updateEmployee(employee).subscribe({
      next: () => fail('Expected an error, but got success response'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
      }
    });
  
    // Expect an API call
    const req = httpMock.expectOne(`${service.apiUrlEmployee}/update`);
    expect(req.request.method).toBe('PUT');
  
    // Simulate an API error response (passing the error as a string directly)
    req.flush(errorMessage, errorResponse);
  
    // Verify that the ToastrService error was called
    expect(toastr.error).toHaveBeenCalledWith(errorMessage, 'Error al actualizar empleado');
  });

});