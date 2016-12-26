
ko.validation.rules["validArray"] = {
    validator: function (arr, bool) {
        if (!arr || typeof arr !== "object" || !(arr instanceof Array)) {
            throw "[validArray] Parameter must be an array";
        }
        return bool === (arr.filter(function (element) {
            return ko.validation.group(ko.utils.unwrapObservable(element))().length !== 0;
        }).length === 0);
    },
    message: "\n'{0}'"
};

ko.extenders.parseJsonDate = function (target) {
    var result = ko.computed({
        read: target,
        write: function (newValue) {
            var valueToWrite;
            if (target && newValue != null) {
                var formattedDate = moment(newValue).format('DD/MM/YYYY');
                valueToWrite = formattedDate;
            } else {
                valueToWrite = '--';
            }
            target(valueToWrite);
        }
    });
    result(target());
    return result;
};

ko.extenders.changeToBool = function (target) {
    var result = ko.computed({
        read: target,
        write: function (newValue) {
            if (newValue != undefined) {
                if (newValue == "1") {
                    return target('true');
                } else {
                    return target('false');
                }
            }
        }
    });
    result(target());
    return result;
};

ko.validation.configure({
    insertMessages: false,
    grouping: { deep: false }
});

function formatDate(value) {
    return value.getDate() + value.getMonth() + "/" + "/" + value.getYear();
}

function InitialAssessmentViewModel() {
    var fullDate = new Date()
    var twoDigitMonth = ((fullDate.getMonth().length + 1) === 1) ? (fullDate.getMonth() + 1) : '0' + (fullDate.getMonth() + 1);
    var currentDate = fullDate.getDate() + "/" + twoDigitMonth + "/" + fullDate.getFullYear();
    var self = this;
    self.CaseID = ko.observable();
    self.PatientImpacts = ko.observableArray();
    self.PatientImpactValues = ko.observableArray();
    self.Practitioners = ko.observableArray([]);
    self.PractitionerID = ko.observable();
    self.CaseAssessmentDetailID = ko.observable();

    // Patient Consent
    self.HasPatientConsentForm = ko.observable().extend({ changeToBool: null }).extend({ required: { message: '\nPatient Consent is required.'} });   
    // Injury and Symptom Details
    self.IncidentAndDiagnosisDescription = ko.observable().extend({ required: { message: '\nInjury and Symptom Details description is required.'} });
    self.CaseAssessmentPatientInjuries = ko.observableArray().extend({ validArray: { params: true, message: '\nEach entry under diagnosis/injury should have a Symptom Description / Affected.'} });
    
    self.NeuralSymptomDescription = ko.observable();
    self.PreExistingConditionDescription = ko.observable().extend({ required: { message: '\nPre Existing Condition description is required.'} });


    self.HasYellowFlags = ko.observable('').extend({ required: { message: '\n Is Patient demonstrate any yellow flags is required.'} });
    self.HasRedFlags = ko.observable('').extend({ required: { message: '\n Is Patient demonstrate any Red flags is required.'} });
    self.IsPatientUndergoingTreatment = ko.observable('').extend({ required: { message: '\n Is the patient already undergoing any treatment is required.'} });
    self.IsPatientTakingMedication = ko.observable('').extend({ required: { message: '\nIs Patient taking medication is required.'} });
    self.PatientRequiresFurtherInvestigation = ko.observable('').extend({ required: { message: '\nDoes Patient require any further investigation is required.'} });

    self.IsAccepted = ko.observable(true);
    self.FactorsAffectingTreatmentDescription = ko.observable().extend({ required: { onlyIf: function () {
        if (self.PatientRequiresFurtherInvestigation() == 'false' || self.PatientRequiresFurtherInvestigation() == false) { return false; }
        else { return true; }
    }, message: '\nFactors affecting treatment detail is required.'
    }
    });

    // Impacts on LifeStyle
    self.CaseAssessmentPatientImpacts = ko.observableArray().extend({ validArray: { params: true, message: "\nPlease select a value for each  impact on lifestyle criteria."} });

    // Impact on work
    self.PatientOccupation = ko.observable().extend({ required: { message: '\nPatient occupation is required.'} });
    self.PatientRoleID = ko.observable().extend({ required: { message: "\nPatient's role is required."} });
    self.WasPatientWorkingAtTheTimeOfTheAccident = ko.observable().extend({ required: { message: "\nPatient's working at the time of the accident is required."} });
    self.HasThePatientHadTimeOff = ko.observable().extend({ required: { message: "\nHas the patient had any time off is required."} });
    self.HasThePatientReturnedToWork = ko.observable().extend({ required: { message: "\nHas the patient return to work is required."} });
    self.AbsentPeriodDurationID = ko.observable().extend({ required: { message: "\nImpact on work Absent Period Duration is required."} });
    self.AbsentPeriod = ko.observable().extend({ required: { message: "\nImpact on work Absent Period Duration value is required." }, number: { message: '\nPlease enter a valid number for "If they have been absent, how many days/weeks have they been absent?"'} });
    self.IsPatientSufferingFinancialLoss = ko.observable().extend({ changeToBool: null }).extend({ required: { message: "\nIs the patient still suffering a financial loss is required."} });
    self.PatientWorkstatuses = ko.observableArray().extend({ validArray: { params: true, message: '\n Current Work Status is required'} });
    self.PatientWorkstatusID = ko.observable().extend({ required: { message: "\nCurrent work status is required."} });
    self.PatientImpactOnWorkID = ko.observable().extend({ required: { message: '\nCurrent impact on work is required.'} });
    // Treatment Recommendation
    self.PatientRecommendedTreatmentSessions = ko.observable().extend({ required: { message: "\nHow many sessions do you recommend is required." }, number: { message: '\nPlease enter a valid number for "How many sessions do you recommend?"'} });
    self.PatientRecommendedTreatmentSessionsDetail = ko.observable();
    self.PatientTreatmentPeriod = ko.observable().extend({ required: { message: "\nOver what period should these be carried out is required." }, number: { message: '\nPlease enter a valid number for "Over what period should these be carried out?"'} });
    self.PatientTreatmentPeriodDurationID = ko.observable().extend({ required: { message: "\nOver what period should these be carried out duration is required."} });
    self.AnticipatedDateOfDischarge = ko.observable(currentDate).extend({ required: { message: "\nWhat is the anticipated date of discharge is required."} });
    self.PatientLevelOfRecoveryID = ko.observable().extend({ required: { message: "\nPatient's level of recovery is required."} });
    self.ProposedTreatmentMethodIDs = ko.observableArray([]).extend({ required: { message: "\nProposed treatment method is required."} }); //.extend({ required: { message: "\nProposed treatment methods is required."} });
    self.HasPatientHomeExerciseProgramme = ko.observable().extend({ changeToBool: null }).extend({ required: { message: "\nHas the patient been given a home exercise programme is required."} });

    // Remaining Impact on Lifestyle
    self.HasCompliedHomeExerciseProgramme = ko.observable();
    // Further Treatment

    //EvidenceOfClinicalReasoning
    self.EvidenceOfClinicalReasoning = ko.observable();

    // Additional Information
    self.AdditionalInformation = ko.observable();
    // Page Dropdowns
    self.PatientRole = ko.observableArray();
    // Additional variables
    self.DeniedMessage = ko.observable();

    self.Init = function (model) {

        var mappingOptions = {
            'BirthDate': {
                create: function (options) { if (model.Patient.BirthDate != null) return moment(options.data).format("DD/MM/YYYY"); }
            },
            'CaseSubmittedDate': {
                create: function (options) { if (model.Case.CaseSubmittedDate != null) return moment(options.data).format("DD/MM/YYYY"); }
            },
            'InjuryDate': {
                create: function (options) { if (model.Patient.InjuryDate != null) return moment(options.data).format("DD/MM/YYYY"); }
            }
            /*'strDateOfInitialAssessment':
            {
            create: function (options) { if (model.strDateOfInitialAssessment != null) return moment(options.data).format("DD/MM/YYYY"); }
            }*/
        };

        self.strDateOfInitialAssessment = ko.observable(model.strDateOfInitialAssessment);


        ko.mapping.fromJS(model, mappingOptions, self);
        ko.mapping.fromJS(model.PatientImpacts, {}, self.PatientImpacts);
        ko.mapping.fromJS(model.PatientImpactValues, {}, self.PatientImpactValues);
        ko.mapping.fromJS(model.PatientWorkstatuses, {}, self.PatientWorkstatuses);
        ko.mapping.fromJS(model.PatientRole, {}, self.PatientRole);

        self.CaseID(model.Case.CaseID);
        if (model.CaseAssessment != null) {
            ko.mapping.fromJS(model.CaseAssessment.CaseAssessmentDetail.CaseAssessmentDetailID, {}, self.CaseAssessmentDetailID);
            self.DeniedMessage(model.CaseAssessment.DeniedMessage);
            self.IsAccepted(model.CaseAssessment.IsAccepted);
            ko.mapping.fromJS(model.CaseAssessment.CaseAssessmentDetail.AbsentPeriodDurationID, {}, self.AbsentPeriodDurationID);
            self.PatientRoleID(model.CaseAssessment.PatientRoleID);
            self.AbsentPeriodDurationID(model.CaseAssessment.CaseAssessmentDetail.AbsentPeriodDurationID);
            self.PractitionerID(model.CaseAssessment.CaseAssessmentDetail.PractitionerID);
            self.WasPatientWorkingAtTheTimeOfTheAccident(model.CaseAssessment.WasPatientWorkingAtTheTimeOfTheAccident != null ? model.CaseAssessment.WasPatientWorkingAtTheTimeOfTheAccident.toString() : 'nullable');
            self.HasThePatientHadTimeOff(model.CaseAssessment.CaseAssessmentDetail.HasThePatientHadTimeOff != null ? model.CaseAssessment.CaseAssessmentDetail.HasThePatientHadTimeOff.toString() : 'nullable');
            self.HasThePatientReturnedToWork(model.CaseAssessment.CaseAssessmentDetail.HasThePatientReturnedToWork != null ? model.CaseAssessment.CaseAssessmentDetail.HasThePatientReturnedToWork.toString() : 'nullable');
            self.PatientImpactOnWorkID(model.CaseAssessment.CaseAssessmentDetail.PatientImpactOnWorkID);
            self.PatientWorkstatusID(model.CaseAssessment.CaseAssessmentDetail.PatientWorkstatusID);
            self.PatientRecommendedTreatmentSessions(model.CaseAssessment.CaseAssessmentDetail.PatientRecommendedTreatmentSessions);
            self.PatientRecommendedTreatmentSessionsDetail(model.CaseAssessment.CaseAssessmentDetail.PatientRecommendedTreatmentSessionsDetail);
            self.PatientTreatmentPeriod(model.CaseAssessment.CaseAssessmentDetail.PatientTreatmentPeriod);
            self.AnticipatedDateOfDischarge(moment(model.CaseAssessment.AnticipatedDateOfDischarge).format('DD/MM/YYYY'));
            self.PatientLevelOfRecoveryID(model.CaseAssessment.CaseAssessmentDetail.PatientLevelOfRecoveryID);
            self.HasPatientHomeExerciseProgramme(model.CaseAssessment.HasPatientHomeExerciseProgramme);
            self.AdditionalInformation(model.CaseAssessment.CaseAssessmentDetail.AdditionalInformation);
            self.EvidenceOfClinicalReasoning(model.CaseAssessment.CaseAssessmentDetail.EvidenceOfClinicalReasoning);
            self.HasPatientConsentForm(model.CaseAssessment.HasPatientConsentForm);

            self.HasYellowFlags(model.CaseAssessment.HasYellowFlags.toString());
            self.HasRedFlags(model.CaseAssessment.HasRedFlags.toString());
            self.IsPatientUndergoingTreatment(model.CaseAssessment.IsPatientUndergoingTreatment.toString());
            self.IsPatientTakingMedication(model.CaseAssessment.IsPatientTakingMedication.toString());
            self.PatientRequiresFurtherInvestigation(model.CaseAssessment.PatientRequiresFurtherInvestigation.toString());

            self.IsPatientSufferingFinancialLoss(model.CaseAssessment.IsPatientSufferingFinancialLoss);
            self.IncidentAndDiagnosisDescription(model.CaseAssessment.IncidentAndDiagnosisDescription);
            self.NeuralSymptomDescription(model.CaseAssessment.NeuralSymptomDescription);
            self.PreExistingConditionDescription(model.CaseAssessment.PreExistingConditionDescription);
            self.PatientOccupation(model.CaseAssessment.PatientOccupation);
            self.FactorsAffectingTreatmentDescription(model.CaseAssessment.FactorsAffectingTreatmentDescription);
            self.AbsentPeriod(model.CaseAssessment.CaseAssessmentDetail.AbsentPeriod);

            if (model.CaseAssessment.ProposedTreatmentMethodIDs.length > 0) {
                $.each(model.CaseAssessment.ProposedTreatmentMethodIDs, function (index, value) {
                    self.ProposedTreatmentMethodIDs.push(value.toString());
                });
            }

            if (model.CaseAssessment.CaseAssessmentPatientInjuries.length > 0) {

                $.each(model.CaseAssessment.CaseAssessmentPatientInjuries, function (index, value) {
                    self.CaseAssessmentPatientInjuries.push(new CaseAssessmentPatientInjury(self.CaseAssessmentDetailID(),
             value));
                });
            }

            if (model.CaseAssessment.CaseAssessmentPatientImpacts.length > 0) {
                $.each(model.CaseAssessment.CaseAssessmentPatientImpacts, function (index, value) {
                    self.CaseAssessmentPatientImpacts.push(new CaseAssessmentPatientImpact(value, model.PatientImpacts[index].PatientImpactName));
                });
            }
        }
        else {
            self.CaseAssessmentPatientInjuries.push(new CaseAssessmentPatientInjury());

            $.each(model.PatientImpacts, function (index, value) {
                self.CaseAssessmentPatientImpacts.push(new CaseAssessmentPatientImpact(value, value.PatientImpactName));
            });

        }


    };

  //self.strDateOfInitialAssessment = ko.observable(model.strDateOfInitialAssessment);

    this.AddMoreInjuryAndSymptoms = function () {
        self.CaseAssessmentPatientInjuries.push(new CaseAssessmentPatientInjury(self.CaseAssessmentDetailID()));
    };

    this.RemovePatientInjury = function (item) {
        self.CaseAssessmentPatientInjuries.remove(item);
    };

    self.errors = ko.validation.group(self);

    this.Print = function () {
        $.post('/PrintPopUp/PrintInitialAssessment', { caseid: this.CaseID() }, function (resp) {
            var mywindow;
            if (navigator.appName == 'Microsoft Internet Explorer') {
                mywindow = window.open('', '', '');
                mywindow.document.write(resp);
                mywindow.document.close();
                mywindow.focus();
                mywindow.print();
                mywindow.close();
            } else {
                mywindow = window.open('', '', '');
                mywindow.document.write(resp);
                mywindow.print();
            }
            return false;
        });
    };

    this.Close = function () {
        if (confirm('Are you sure you want to close this form?')) {
            window.location.href = '/Supplier/ExistingPatientsInitialAssessment/';
        }
    };

    this.SubmitInitialAssessmentform = function () {
        var errors = "Errors ";
        if (!self.isValid()) {
            $.each(self.errors(), function (index, value) {
                errors = errors + ' ' + value();
            });
            alert(errors);
            return false;
        }
        $('#divGridDisplaySpinner').spin();
        $('#frmInitialAssessment').submit();

    };

    this.InitialAssessmentSuccess = function (responseText, statusText, xhr, $form) {

        alert(responseText);
        $('#divGridDisplaySpinner').spin(false);
        window.location.href = '/Supplier/ExistingPatientsInitialAssessment';
    };


    ko.bindingHandlers.ajaxForm = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            $(element).ajaxForm(value);
        }
    };

};


function CaseAssessmentPatientInjury(caseAssessmentDetailID, data) {
    var self = this;
    self.CaseAssessmentDetailID = ko.observable(caseAssessmentDetailID);
    self.CaseAssessmentPatientInjuryID = ko.observable();
    self.AffectedArea = ko.observable().extend({ required: { message: '\n Affected area is required.'} });
    self.Score = ko.observable().extend({ required: { message: '\nPain Score is required' }});
    self.Restriction = ko.observable().extend({ required: { message: '\nRestriction is required.'} });
    ko.mapping.fromJS(data, {}, self);
};

function CaseAssessmentPatientImpact(data, patientImpactName) {
    var self = this;
    self.CaseAssessmentPatientImpactID = ko.observable();
    self.PatientImpactID = ko.observable();
    self.PatientImpactValueID = ko.observable().extend({ required: { message: '\Patient Impact is required.'} });
    self.Comment = ko.observable();
    self.CaseAssessmentDetailID = ko.observable();
    self.PatientImpactName = ko.observable(patientImpactName);
    ko.mapping.fromJS(data, {}, self);

};

// Validation for pain score
function checkPainScore() {    
    if (document.getElementById("txtPainScore").value.trim() != '')
    {
        if (document.getElementById("txtPainScore").value.trim().match(new RegExp('(^([0-9][/]([1-9]|10))$)|(^([0-9]|10)$)'))) {            
            var a = parseInt((document.getElementById("txtPainScore").value).substring(0, 1));
            var b = parseInt((document.getElementById("txtPainScore").value).substring(2, 5));
            if (a <= b) {
                if (b - a > 1) {
                    alert("Invalid Value - Hint : (7/8, 4/5)");
                    document.getElementById("txtPainScore").focus();
                }
            }
            else if (a > b) {
                alert("Invalid Value - Hint : (7/8, 4/5)");
                document.getElementById("txtPainScore").focus();
            }
        }
        else {
            alert("Invalid format (eg. 8/10)");
            document.getElementById("txtPainScore").focus();
        }
    }        
}    


