import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable, of } from "rxjs";
import { AuthService } from "src/app/auth/services/auth.service";
import { CustomValidators } from "src/app/validators/custom-validator";
import { BankService } from "../../services/bank.service";
import { Account } from "../../types/account";
import { Loan } from "../../types/loan";

@Component({
  selector: "app-loan",
  templateUrl: "./loan.component.html",
  styleUrls: ["./loan.component.css"],
})
export class LoanComponent implements OnInit {

  loanForm!: FormGroup;
  accounts$: Observable<Account[]> = of();
  loanError$: Observable<string> = of();
  loanSuccess$: Observable<string> = of();
  isFormSubmitted: boolean = false;
  userId: number = 0;
  interest: number = 0;
  emi : number =0;
  emi$: Observable<any> = of();
  emiCalculatorError$: Observable<string> = of();
  emiCalculatorSuccess$: Observable<string> = of();

  constructor(
    private authService: AuthService,
    private bankService: BankService,
    private formBuilder: FormBuilder,
    private customValidators: CustomValidators,
  ) {
    
  }

  ngOnInit(): void {
      this.accounts$ = this.bankService.getAccountByUserId(this.userId);
      this.loanForm = this.formBuilder.group({
        loanType: ["", [Validators.required]],
        amount: ["", [Validators.required, this.customValidators.AmountValidator]],
        tenure: ["", [Validators.required, Validators.min(1),this.customValidators.TenureValidator]],  //add min
      });
  }
  onSubmit(): void {
    
    this.isFormSubmitted = true;
    if (this.loanForm.invalid) {
      return;

    } else {
      const data = this.loanForm.value;
      const loan: Loan = new Loan(data);
      loan.customer.userId = this.authService.getUserId();

      this.bankService.saveLoan(loan).subscribe(
        () => {
          this.loanSuccess$ = of("Loan Approved");
        },
        () => {
          this.loanError$ = of("Loan Not Approved");
        }
      );
    }

  }
  callChange()
  {
    if(this.loanForm.value.loanType == "Home Loan"){
      this.interest = 9;
    }
    else if(this.loanForm.value.loanType == "Education Loan"){
      this.interest = 8;
    }
    else if(this.loanForm.value.loanType == "Personal Loan"){
      this.interest = 7;
    }
    else{
      this.interest = 6;
    }

    const data = this.loanForm.value;
      const loan: Loan = new Loan(data);

    this.emi$ = this.bankService.getEMI(loan)
        this.emi$.subscribe(
          (res: any) => {
            this.emi = res;//of("Success");

          },
          () => {
            this.emiCalculatorError$ = of("fail");
          }
        );
  }
}