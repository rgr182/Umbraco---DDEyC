//------------------------------------------------------------------------------
// <auto-generated>
//   This code was generated by a tool.
//
//    Umbraco.ModelsBuilder.Embedded v13.0.3+a0f3c15
//
//   Changes to this file will be lost if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Linq.Expressions;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Infrastructure.ModelsBuilder;
using Umbraco.Cms.Core;
using Umbraco.Extensions;

namespace Umbraco.Cms.Web.Common.PublishedModels
{
	/// <summary>LoginPage</summary>
	[PublishedModel("loginPage")]
	public partial class LoginPage : PublishedContentModel, IHeaderProperties
	{
		// helpers
#pragma warning disable 0109 // new is redundant
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		public new const string ModelTypeAlias = "loginPage";
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		public new const PublishedItemType ModelItemType = PublishedItemType.Content;
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[return: global::System.Diagnostics.CodeAnalysis.MaybeNull]
		public new static IPublishedContentType GetModelContentType(IPublishedSnapshotAccessor publishedSnapshotAccessor)
			=> PublishedModelUtility.GetModelContentType(publishedSnapshotAccessor, ModelItemType, ModelTypeAlias);
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[return: global::System.Diagnostics.CodeAnalysis.MaybeNull]
		public static IPublishedPropertyType GetModelPropertyType<TValue>(IPublishedSnapshotAccessor publishedSnapshotAccessor, Expression<Func<LoginPage, TValue>> selector)
			=> PublishedModelUtility.GetModelPropertyType(GetModelContentType(publishedSnapshotAccessor), selector);
#pragma warning restore 0109

		private IPublishedValueFallback _publishedValueFallback;

		// ctor
		public LoginPage(IPublishedContent content, IPublishedValueFallback publishedValueFallback)
			: base(content, publishedValueFallback)
		{
			_publishedValueFallback = publishedValueFallback;
		}

		// properties

		///<summary>
		/// Logo
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("logo")]
		public virtual global::Umbraco.Cms.Core.Models.PublishedContent.IPublishedContent Logo => this.Value<global::Umbraco.Cms.Core.Models.PublishedContent.IPublishedContent>(_publishedValueFallback, "logo");

		///<summary>
		/// Recovery Url
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("recoveryUrl")]
		public virtual global::Umbraco.Cms.Core.Models.Link RecoveryUrl => this.Value<global::Umbraco.Cms.Core.Models.Link>(_publishedValueFallback, "recoveryUrl");

		///<summary>
		/// RegistrationPage
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("registrationPage")]
		public virtual global::System.Collections.Generic.IEnumerable<global::Umbraco.Cms.Core.Models.Link> RegistrationPage => this.Value<global::System.Collections.Generic.IEnumerable<global::Umbraco.Cms.Core.Models.Link>>(_publishedValueFallback, "registrationPage");

		///<summary>
		/// Subtitle
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("subtitle")]
		public virtual string Subtitle => this.Value<string>(_publishedValueFallback, "subtitle");

		///<summary>
		/// Title
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("title")]
		public virtual string Title => this.Value<string>(_publishedValueFallback, "title");

		///<summary>
		/// Header Image 2
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("bottomHeaderImage1")]
		public virtual global::Umbraco.Cms.Core.Models.MediaWithCrops BottomHeaderImage1 => global::Umbraco.Cms.Web.Common.PublishedModels.HeaderProperties.GetBottomHeaderImage1(this, _publishedValueFallback);

		///<summary>
		/// Header Image 3
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("bottomHeaderImage2")]
		public virtual global::Umbraco.Cms.Core.Models.MediaWithCrops BottomHeaderImage2 => global::Umbraco.Cms.Web.Common.PublishedModels.HeaderProperties.GetBottomHeaderImage2(this, _publishedValueFallback);

		///<summary>
		/// Header Image Url 1
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("headerImageUrl1")]
		public virtual global::Umbraco.Cms.Core.Models.Link HeaderImageUrl1 => global::Umbraco.Cms.Web.Common.PublishedModels.HeaderProperties.GetHeaderImageUrl1(this, _publishedValueFallback);

		///<summary>
		/// Header Image Url 2
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("headerImageUrl2")]
		public virtual global::Umbraco.Cms.Core.Models.Link HeaderImageUrl2 => global::Umbraco.Cms.Web.Common.PublishedModels.HeaderProperties.GetHeaderImageUrl2(this, _publishedValueFallback);

		///<summary>
		/// Header Image Url 3
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("headerImageUrl3")]
		public virtual global::Umbraco.Cms.Core.Models.Link HeaderImageUrl3 => global::Umbraco.Cms.Web.Common.PublishedModels.HeaderProperties.GetHeaderImageUrl3(this, _publishedValueFallback);

		///<summary>
		/// Hide Header Images
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[ImplementPropertyType("hideHeaderImages")]
		public virtual bool HideHeaderImages => global::Umbraco.Cms.Web.Common.PublishedModels.HeaderProperties.GetHideHeaderImages(this, _publishedValueFallback);

		///<summary>
		/// Header Image 1
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "13.0.3+a0f3c15")]
		[global::System.Diagnostics.CodeAnalysis.MaybeNull]
		[ImplementPropertyType("topHeaderImage")]
		public virtual global::Umbraco.Cms.Core.Models.MediaWithCrops TopHeaderImage => global::Umbraco.Cms.Web.Common.PublishedModels.HeaderProperties.GetTopHeaderImage(this, _publishedValueFallback);
	}
}
