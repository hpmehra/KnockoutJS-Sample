function SearchEducationViewModel() {
    var self = this;
    self.EducatoinSearchResults = ko.observableArray();
    self.scrolled = ko.observableArray([]);
    self.searchText = ko.observable();
    self.maxId = ko.observable(0);
    self.CurrentPage = ko.observable(0);
    self.TotolCount = ko.observable(0);
    self.pendingRequest = ko.observable(false);
    self.PagedRecords = ko.observable(0);
    $('#loaderDiv').hide();
    self.scrolled = function (data, event) {
        if (!self.pendingRequest()) {
            if (self.TotolCount() > self.maxId()) {
                var elem = event.target;
                if (elem.scrollTop > (elem.scrollHeight - elem.offsetHeight - 1)) {
                    getAllSearchEducation();
                }
            }
            else {
                self.pendingRequest(true);
            }
        }
    }
    function getAllSearchEducation() {
        if (!self.pendingRequest()) {
            $("#loaderDiv").show();
            $.post("/education/SearchEducation", { skip: self.maxId(),searchText:self.searchText () }, function (data) {
                var data = $.parseJSON(data);
                for (var i = 0; i < data.Educations.length; i++) {
                    self.EducatoinSearchResults.push(new InsertEducatoinLineItem(data.Educations[i].CollegeName, data.Educations[i].CourseName, moment(data.Educations[i].CourseUploadDate).format("MM/DD/YYYY"),
                                     data.Educations[i].NumberOfModule, data.Educations[i].EducationID));
                }
                self.TotolCount(data.TotalCount);
                self.CurrentPage(self.maxId());
                self.maxId(self.maxId() + data.PagedRecords);
                $('#loaderDiv').hide();
            });
        }
    }

    self.EducationSearchFormBeforeSubmit = function (arr, $form, options) {
        if ($("#frmSearchEducation").jqBootstrapValidation('hasErrors')) {
            return false;
        }
        return true;
    }
    self.addNewEducation = function () {
        window.location = '/education/addEducation';
    }
    self.updateEducation = function (model) {
        window.location = '/education/editEducation?educationID=' + model.EducationID();
    }

    var mappingOptions = {
        CourseUploadDate: {
            create: function (options) {
                return moment(options.data).format("MM/DD/YYYY");
            }
        }
    };
    self.SearchEducationSuccess = function (model) {
        var _model = $.parseJSON(model);
        self.pendingRequest(false);
        self.CurrentPage(0);
        self.TotolCount(0);
        self.maxId(0);
        if (!self.pendingRequest()) {
            $("#loaderDiv").show();
            ko.mapping.fromJS(_model.Educations, mappingOptions, self.EducatoinSearchResults);
            self.TotolCount(_model.TotalCount);
            self.CurrentPage(self.maxId());
            self.maxId(self.maxId() + _model.PagedRecords);
            $('#loaderDiv').hide();
        }
    }
    function InsertEducatoinLineItem(_CollegeName, _CourseName, _CourseUploadDate, _NumberOfModule, _EducationID) {
        var self = this;
        self.CollegeName = ko.observable(_CollegeName);
        self.CourseName = ko.observable(_CourseName);
        self.CourseUploadDate = ko.observable(_CourseUploadDate);
        self.NumberOfModule = ko.observable(_NumberOfModule);
        self.EducationID = ko.observable(_EducationID);
    }

}