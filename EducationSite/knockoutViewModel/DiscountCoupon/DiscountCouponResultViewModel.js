function DiscountCouponGridViewModel() {
    var self = this;
    self.Educations = ko.observableArray();
    self.CouponID = ko.observable();
    self.CouponCode = ko.observable();
    self.CouponType = ko.observable('Percent');
    self.CouponEducationID = ko.observable();
    self.CouponProduactID = ko.observable();
    self.CouponDiscount = ko.observable();
    self.CouponExpiryDate = ko.observable().extend({ required: true });
    self.CouponIssueDate = ko.observable();
    self.CoupanValid = ko.observable();
    self.noofcoupon = ko.observable();
    self.couponFor = ko.observable('Course');
    self.DiscountCouponForCourses = ko.observableArray();
    self.scrolled = ko.observableArray([]);
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
                    getAlldiscountcoupon();
                }
            }
            else {
                self.pendingRequest(true);
            }
        }
    }
    $(document).ready(function () {
        $('#CouponExpiryDate').datepicker();
        $('#CouponDiscount').attr('maxlength', '2');
        getAlldiscountcoupon();
        $.post("/Education/getEducationActive", function (_data) {
            var data = $.parseJSON(_data);
            for (var i = 0; i < data.length; i++) {
                self.Educations.push(new Education(data[i].EducationID, data[i].flag, data[i].CourseName));
            }
        });
    });
    self.checkData = function () {
        if ($('input[name=CouponType]:checked').val() == "Percent") {
            self.CouponDiscount.extend({ numeric: 0 });
            $('#CouponDiscount').val('');
            $('#CouponDiscount').attr('maxlength', '2');
        }
        if ($('input[name=CouponType]:checked').val() == "Fixed") {
            $('#CouponDiscount').val('');
            $('#CouponDiscount').attr('maxlength', '10');
        }
    }

    self.AddCheckData = function () {
        if ($('input[name=CouponType]:checked').val() == "Fixed") {
            self.CouponDiscount.extend({ numeric: 2 });
        }
        if ($('input[name=CouponType]:checked').val() == "Percent") {
            self.CouponDiscount.extend({ numeric: 0 });
        }
    }

    function getAlldiscountcoupon() {
        if (!self.pendingRequest()) {
            $("#loaderDiv").show();
            $.post("/DiscountCoupon/GetAllPagedDiscountCouponForCourse", { skip: self.maxId() }, function (data) {
                var data = $.parseJSON(data);
                for (var i = 0; i < data.DiscountCoupansForCourse.length; i++) {
                    self.DiscountCouponForCourses.push(new InsertDiscountCouponLineItem(data.DiscountCoupansForCourse[i].CouponID, data.DiscountCoupansForCourse[i].CouponCode, data.DiscountCoupansForCourse[i].CouponType,
                                     data.DiscountCoupansForCourse[i].CouponDiscount, moment(data.DiscountCoupansForCourse[i].CouponExpiryDate).format("MM/DD/YYYY"), data.DiscountCoupansForCourse[i].CouponIssueDate, data.DiscountCoupansForCourse[i].CoupanValid, data.DiscountCoupansForCourse[i].CourseName));
                }
                self.TotolCount(data.TotalCount);
                self.CurrentPage(self.maxId());
                self.maxId(self.maxId() + data.PagedRecords);
                $('#loaderDiv').hide();
            });
        }
    }
    function Education(id, isDone, name) {
        var self = this;
        self.EducationID = ko.observable(id);
        self.isDone = ko.observable(isDone);
        self.CourseName = ko.observable(name);
    }
    self.AddDiscouontCoupon = function () {
        var self = this;
        self.filteredRecords = function () {
            return ko.utils.arrayFilter(self.Educations(), function (Education) {
                return Education.isDone() == true;
            });
        }
        if ($("#CouponExpiryDate").val() == "" || $("#noofcoupon").val() == "" || $("#CouponDiscount").val() == "") {
            $("#btnsubmit").click();
        }
        else {
            if (self.filteredRecords().length == 0) {
                alertify.alert('Select atleast one education')
            }
            else {
                var coupontype = $('#College :selected').val();
                $.ajax({
                    type: "POST",
                    url: "/DiscountCoupon/Add",
                    data: ko.toJSON({ myList: self.filteredRecords(), CouponType: self.CouponType(), CouponDiscount: self.CouponDiscount(), CouponExpiryDate: self.CouponExpiryDate(), noofcoupon: self.noofcoupon(), couponFor: self.couponFor() }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        for (var i = 0; i < data.length; i++) {
                            self.DiscountCouponForCourses.splice(0, 0, new InsertDiscountCouponLineItem(data[i].CouponID, data[i].CouponCode, data[i].CouponType,
                                                     data[i].CouponDiscount, moment(data[i].CouponExpiryDate).format("MM/DD/YYYY"), data[i].CouponIssueDate, data[i].CoupanValid, data[i].CouponEducationName));
                            $("#main").scrollTop(0);
                            self.TotolCount(self.TotolCount() + 1);
                            self.maxId(self.maxId() + 1);
                        }
                        self.Educations.removeAll();
                        $.post("/Education/getEducationActive", function (_data) {
                            var data = $.parseJSON(_data);
                            for (var i = 0; i < data.length; i++) {
                                self.Educations.push(new Education(data[i].EducationID, data[i].flag, data[i].CourseName));
                            }
                        });
                        alertify.success(" Discount Added Successfully");
                    }
                });
                resetcontrol();
            }
        }
    };
    function resetcontrol() {
        self.CouponType('Percent');
        $('#CouponDiscount').attr('maxlength', '2');
        self.CouponDiscount("");
        self.CouponExpiryDate("");
        self.CouponIssueDate("");
        self.noofcoupon("");
        self.couponFor('Course');
    }
    function InsertDiscountCouponLineItem(_CouponID, _CouponCode, _CouponType, _CouponDiscount, _CouponExpiryDate, _CouponIssueDate, _CoupanValid, _CourseName) {
        var self = this;
        self.CouponID = ko.observable(_CouponID);
        self.CouponCode = ko.observable(_CouponCode);
        self.CouponType = ko.observable(_CouponType);
        self.CouponDiscount = ko.observable(_CouponDiscount);
        self.CouponExpiryDate = ko.observable(_CouponExpiryDate);
        self.CouponIssueDate = ko.observable(_CouponIssueDate);
        self.CoupanValid = ko.observable(_CoupanValid);
        self.CourseName = ko.observable(_CourseName);
    }
    self.DiscountCouponInfoFormBeforeSubmit = function (arr, $form, options) {
        if ($("#divAddDiscountCoupon").jqBootstrapValidation('hasErrors')) {
            return false;
        }
        return true;
    };
    this.deleteDiscountCoupon = function (itemToDelete) {
        alertify.confirm("Are you sure want to delete this?", function (e) {
            if (e) {
                $.ajax({
                    url: "/DiscountCoupon/DeleteDiscountCoupon",
                    cache: false,
                    type: "POST", dataType: 'json',
                    contentType: 'application/json',
                    data: ko.toJSON({ discountCoupon: itemToDelete }),
                    success: function (data) {
                        self.DiscountCouponForCourses.remove(function (item) { return item.CouponID == itemToDelete.CouponID });
                        self.TotolCount(self.TotolCount() - 1);
                        if (self.CurrentPage() < self.TotolCount() && self.TotolCount() > self.DiscountCouponForCourses().length) {
                            $.post("/DiscountCoupon/GetAllPagedDiscountCouponForCourse", { skip: self.maxId() - 1, take: 1 }, function (_data) {
                                var data = $.parseJSON(_data);
                                $("#loaderDiv").show();
                                var data = $.parseJSON(_data);
                                for (var i = 0; i < data.DiscountCoupansForCourse.length; i++) {
                                    self.DiscountCouponForCourses.push(new InsertDiscountCouponLineItem(data.DiscountCoupansForCourse[i].CouponID, data.DiscountCoupansForCourse[i].CouponCode, data.DiscountCoupansForCourse[i].CouponType,
                                     data.DiscountCoupansForCourse[i].CouponDiscount, moment(data.DiscountCoupansForCourse[i].CouponExpiryDate).format("MM/DD/YYYY"), data.DiscountCoupansForCourse[i].CouponIssueDate, data.DiscountCoupansForCourse[i].CoupanValid, data.DiscountCoupansForCourse[i].CourseName));
                                }
                                self.TotolCount(data.TotalCount);
                                $('#loaderDiv').hide();
                            });
                        }
                        alertify.success(data);
                    },
                    error: function (data) {
                        alert("Error while deleting a Discount Coupon - " + data);
                    }
                });
            }
        });
    };
    ko.bindingHandlers.date = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = valueAccessor();
            var allBindings = allBindingsAccessor();
            var valueUnwrapped = ko.utils.unwrapObservable(value);
            var pattern = allBindings.format || 'DD/MM/YYYY';
            var output = "-";
            if (valueUnwrapped !== null && valueUnwrapped !== undefined && valueUnwrapped.length > 0) {
                output = moment(valueUnwrapped).format(pattern);
            }
            if ($(element).is("input") === true) {
                $(element).val(output);
            } else {
                $(element).text(output);
            }
        }
    };
}