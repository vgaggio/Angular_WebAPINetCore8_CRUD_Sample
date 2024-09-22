import { Component, OnInit } from '@angular/core';
import { Employee } from '../employee.model';
import { EmployeeService } from '../employee.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-addemployee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addemployee.component.html',
  styleUrls: ['./addemployee.component.css']
})
export class AddemployeeComponent implements OnInit {
  newEmployee: Employee = new Employee(0, '', '');
  submitBtnText: string = "Create";
  imgLoadingDisplay: string = 'none';

  constructor(private employeeService: EmployeeService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const employeeId = params['id'];
      if(employeeId)
      this.editEmployee(employeeId);
    });
  }

  addEmployee(employee: Employee) {

    if (employee.name == "")
      return;

    this.submitBtnText = "";
    this.imgLoadingDisplay = 'inline';

    if (employee.id == 0) {
      employee.createdDate = new Date().toISOString();
      this.employeeService.createEmployee(employee).subscribe(result=>this.router.navigate(['/']), error=>{this.resetButtonState(0)});
    }
    else {
      employee.createdDate = new Date().toISOString();
      this.employeeService.updateEmployee(employee).subscribe(result=>this.router.navigate(['/']), error=>{this.resetButtonState(1)});
    }
  }

  editEmployee(employeeId: number) {
    this.employeeService.getEmployeeById(employeeId).subscribe(res => {
      this.newEmployee.id = res.id;
      this.newEmployee.name = res.name
      this.submitBtnText = "Edit";
    });
  }

  private resetButtonState(mode: number) {
    if (mode == 0)
      this.submitBtnText = "Create";
    else if (mode == 1)
      this.submitBtnText = "Edit";
    this.imgLoadingDisplay = 'none';
}

}
